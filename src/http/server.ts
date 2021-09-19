import * as Drash from "../../mod.ts";
import { DrashRequest} from "./request.ts"
import { parseBody } from "./request.ts"

/**
 * This class handles the entire request-resource-response lifecycle. It is in
 * charge of handling incoming requests, matching them to resources for further
 * processing, and sending responses based on the processes set in the resource.
 * It is also in charge of sending error responses that "bubble up" during the
 * request-resource-response lifecycle.
 */
export class Server {
  /**
   * See Drash.Interfaces.IServerOptions.
   */
  readonly #options: Drash.Interfaces.IServerOptions;

  /**
   * The Deno server object (after calling `serve()`).
   */
  #deno_server!: Deno.Listener;

  /**
   * The Deno server request object handler. This handler gets wrapped around
   * the Deno server request object and acts as a proxy to interact with the
   * Deno server request object.
   *
   * The Drash.Request object is not actually a request object. Surprise!
   */
  #handlers: {
    resource_handler: Drash.ResourceHandler;
  } = {
    resource_handler: new Drash.ResourceHandler(),
  };

  /**
   * The internal and external services used by this server. Internal services
   * are ones created by Drash. External services are ones specified by the
   * user.
   */
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param options - See the interface for the options' schema.
   */
  constructor(options: Drash.Interfaces.IServerOptions) {
    this.#options = this.#setOptions(options);
    this.#handlers.resource_handler.addResources(
      this.#options.resources ?? [],
      this.#options,
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - GETTERS / SETTERS ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Get the full address that this server is running on.
   */
  get address(): string {
    return `${this.#options.protocol}://${this.#options.hostname}:${this.#options.port}`;
  }


  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Close the server.
   */
  public close(): void {
    try {
      this.#deno_server.close();
    } catch (_error) {
      // Do nothing. The server was probably already closed.
    }
  }

  public run() {
    if (this.#options.protocol === "http") {
      return this.#runHttp()
    }
    if (this.#options.protocol === "https") {
      return this.#runHttps()
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PRIVATE METHODS /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////


  /**
   * Handle errors thrown during runtime. These errors get sent as the response
   * to the client.
   *
   * @param request - The request object.
   * @param error - The error that was thrown during runtime.
   */
  #handleError(
    error: Drash.Errors.HttpError,
    respondWith: (r: Response | Promise<Response>) => Promise<void>
  ) {
    // TODO(crookse TODO-ERRORS) The error should be a response object so we can
    // just call request.respond(error);
    respondWith(new Response(error.stack, {
      status: error.code,
    }));
  }

  /**
   * Handle an HTTP request from the Deno server.
   *
   * @param originalRequest - The Deno request object.
   */
  async #handleRequest(
    originalRequest: Request,
    respondWith: (r: Response | Promise<Response>) => Promise<void>
  ): Promise<void> {
    // Ordering of logic matters, because we dont want to spend time calculating
    // for something the user would never need, eg parsing the body for a user to never use it.
    // So here is what we do:
    //
    // 1. Create the request object (minimal impact)
    // 2. Get the resource using the request (minimal-medium impact, cant be avoided)
    // 3. Fail early if resource isnt found

    // Automatically parse the request body for the user.
    //
    // Although this call slows down the request-resource-response lifecycle
    // (removes ~1k req/sec in benchmarks), calling this here makes it more
    // convenient for the user when writing a resource. For example, if this
    // call were to be placed in the Drash.Request class and only executed when
    // a user wants to retrieve body params, then they would have to use
    // `async-await` in their resource.This means more boilerplate for their
    // resource, which is something we should prevent.
    //
    // Reason why this code is at this specific line is so we dont expose the `parseBody` function on the drash request class to the user, as it
    // is an internal API method and so it isn't included in the API docs on doc.deno.land
    const parsedBody = originalRequest.body ? await parseBody(originalRequest) : {}

    const result = this.#handlers.resource_handler.getResource(originalRequest);

    if (!result) {
      throw new Drash.Errors.HttpError(404);
    }

    const { resource, pathParams } = result

    const request = new DrashRequest(originalRequest, parsedBody, pathParams)

    const method = request.method.toUpperCase() as Drash.Types.THttpMethod;

    // If the method does not exist on the resource, then the method is not
    // allowed. So, throw that 405 and GTFO.
    if (!(method in resource)) {
      throw new Drash.Errors.HttpError(405);
    }

    // Server before resource middleware
    for (const Service of this.#options.services) {
      const service: Drash.Interfaces.IService = new Service()
      // pass resource req and res if a middleware modifies them
      if (!service.runBeforeResource) {
        continue
      }
      await service.runBeforeResource(resource.request, resource.response)
    }

    // Class before resource middleware
    if (resource.services && resource.services.ALL) {
      for (const Service of resource.services.ALL) {
        const service: Drash.Interfaces.IService = new Service()
        if (!service.runBeforeResource) {
          continue
        }
        await service.runBeforeResource(resource.request, resource.response)
      }
    }

    // resource before middleware
    if (resource.services && resource.services[method]) {
      for (const Service of resource.services[method] as typeof Drash.Service[]) {
        const service: Drash.Interfaces.IService = new Service()
        if (!service.runBeforeResource) {
          continue
        }
        await service.runBeforeResource(resource.request, resource.response)
      }
    }

    // Execute the HTTP method on the resource
    const response = await resource![method as Drash.Types.THttpMethod]!();

    // after resource middleware
    if (resource.services && method in resource.services) {
      for (const Service of resource.services![method] as typeof Drash.Service[]) {
        const service: Drash.Interfaces.IService = new Service()
        if (!service.runAfterResource) {
          continue
        }
        await service.runAfterResource(resource.request, resource.response)
      }
    }

    // Class after resource middleware
    if (resource.services && resource.services.ALL) {
      for (const Service of resource.services!.ALL) {
        const service: Drash.Interfaces.IService = new Service()
        if (!service.runAfterResource) {
          continue
        }
        await service.runAfterResource(resource.request, resource.response)
      }
    }

    for (const Service of this.#options.services) {
      const service: Drash.Interfaces.IService = new Service()
      if (!service.runAfterResource) {
        continue
      }
      await service.runAfterResource(resource.request, response)
    }

    respondWith(new Response(response.body, {
      status: response.status,
      statusText: response.status_text,
      headers: response.headers,
    }));
  }

  /**
   * Listen for incoming requests.
   */
  async #listenForRequests() {
    console.log('hello')
    for await (const conn of this.#deno_server) {
      (async () => {
        for await (const { request, respondWith } of Deno.serveHttp(conn)) {
        try {
          await this.#handleRequest(request, respondWith);
        } catch (error) {
          await this.#handleError(error, respondWith);
        }
       }
      })()
    }
    console.log('bye')
  }

  /**
   * Run the server in HTTP mode.
   *
   * @returns The Deno server object.
   */
  #runHttp(): Deno.Listener {
    this.#deno_server = Deno.listen({
      hostname: this.#options.hostname!,
      port: this.#options.port!,
    });

    this.#listenForRequests();

    return this.#deno_server;
  }

  /**
   * Run the server in HTTPS mode.
   *
   * @returns The Deno server object.
   */
  #runHttps(): Deno.Listener {
    this.#deno_server = Deno.listenTls({
      hostname: this.#options.hostname!,
      port: this.#options.port!,
      certFile: this.#options.cert_file!,
      keyFile: this.#options.key_file!,
    });

    this.#listenForRequests();

    return this.#deno_server;
  }

  #setOptions(options: Drash.Interfaces.IServerOptions): Drash.Interfaces.IServerOptions {
    if (!options.default_response_type) {
      options.default_response_type = "application/json";
    }

    if (!options.services) {
      options.services = []
    }

    if (!options.hostname) {
      options.hostname = "0.0.0.0";
    }

    if (!options.port) {
      options.port = 1337;
    }

    if (!options.resources) {
      options.resources = [];
    }

    return options;
  }
}
