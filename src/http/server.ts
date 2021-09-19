import * as Drash from "../../mod.ts";
import { DrashRequest} from "./request.ts"

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

  #httpConn!: Deno.HttpConn

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
      this.#httpConn.close()
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

    const resource = this.#handlers.resource_handler.getResource(originalRequest);

    if (!resource) {
      console.error("NO RESOUCR WOW")
      throw new Drash.Errors.HttpError(404);
    }

    console.log('uri paths', resource.uri_paths)
    //const matchedParams = this.#handlers.resource_handler.getMatchedPathAndParams(new URL(originalRequest.url).pathname, resource.uri_paths)
    //console.log('matched params', matchedParams)

    // What we're going to do here is, we know we have a resource, now we just have to map
    // the path params on the resource paths to values in the uri
    const matchedParams = new Map()
    let pathname = new URL(originalRequest.url).pathname
    if (pathname[pathname.length - 1] === "/") {
      pathname = pathname.slice(0, -1)
    }
    const pathnameSplit = pathname.split("/")
    console.log('PATHNAME SPLIT', pathnameSplit, 'URI PATHS', resource.uri_paths)
    for (const i in pathnameSplit) {
      // loop through until we reach an `:`, then use that as the name and the value from the uri
      for (const path of resource.uri_paths) {
        const aplit = path.split("/")
        if (aplit[i] && aplit[i].includes(":")) {
          matchedParams.set(aplit[i].replace(':', '').replace('?', ''), pathnameSplit[i])
        }
      }
    }
    console.log('M BLUBBER', matchedParams)

    const request = await Drash.DrashRequest.create(originalRequest, matchedParams)
    const response = new Drash.DrashResponse(this.#options.default_response_type as string)
    response.headers.set('Content-Type', this.#options.default_response_type as string)

    const context = {
      request,
      response
    }

    const method = request.method.toUpperCase() as Drash.Types.THttpMethod;

    // If the method does not exist on the resource, then the method is not
    // allowed. So, throw that 405 and GTFO.
    if (!(method in resource)) {
      throw new Drash.Errors.HttpError(405);
    }

    // Server before resource middleware
    if (this.#options.services) {
    for (const Service of this.#options.services) {
      const service: Drash.Interfaces.IService = new Service()
      // pass resource req and res if a middleware modifies them
      if (!service.runBeforeResource) {
        continue
      }
      await service.runBeforeResource(context)
    }
  }

    // Class before resource middleware
    if (resource.services && resource.services.ALL) {
      for (const Service of resource.services.ALL) {
        const service: Drash.Interfaces.IService = new Service()
        if (!service.runBeforeResource) {
          continue
        }
        await service.runBeforeResource(context)
      }
    }

    // resource before middleware
    if (resource.services && resource.services[method]) {
      for (const Service of resource.services[method] as typeof Drash.Service[]) {
        const service: Drash.Interfaces.IService = new Service()
        if (!service.runBeforeResource) {
          continue
        }
        await service.runBeforeResource(context)
      }
    }

    // Execute the HTTP method on the resource
    await resource![method as Drash.Types.THttpMethod]!(context);

    // Sanity checks
    if (!response.body) {
      throw new Drash.Errors.HttpError(418, "The response body must be set from within a resource or service before the response is sent")
    }

    // after resource middleware
    if (resource.services && method in resource.services) {
      for (const Service of resource.services![method] as typeof Drash.Service[]) {
        const service: Drash.Interfaces.IService = new Service()
        if (!service.runAfterResource) {
          continue
        }
        await service.runAfterResource(context)
      }
    }

    // Class after resource middleware
    if (resource.services && resource.services.ALL) {
      for (const Service of resource.services!.ALL) {
        const service: Drash.Interfaces.IService = new Service()
        if (!service.runAfterResource) {
          continue
        }
        await service.runAfterResource(context)
      }
    }

    if (this.#options.services) {
    for (const Service of this.#options.services) {
      const service: Drash.Interfaces.IService = new Service()
      if (!service.runAfterResource) {
        continue
      }
      await service.runAfterResource(context)
    }
  }

  console.log('responding with', response.body)
    respondWith(new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
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
        this.#httpConn = Deno.serveHttp(conn)
        for await (const { request, respondWith } of this.#httpConn) {
        try {
          await this.#handleRequest(request, respondWith);
        } catch (error) {
          console.log('err')
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
