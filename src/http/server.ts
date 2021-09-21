import * as Drash from "../../mod.ts";

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

  #httpConn!: Deno.HttpConn;

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
      this.#httpConn.close();
    } catch (_error) {
      // Do nothing. The server was probably already closed.
    }
  }

  public run() {
    if (this.#options.protocol === "http") {
      return this.#runHttp();
    }
    if (this.#options.protocol === "https") {
      return this.#runHttps();
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
    respondWith: (r: Response | Promise<Response>) => Promise<void>,
  ) {
    // TODO(crookse TODO-ERRORS) The error should be a response object so we can
    // just call request.respond(error);
    respondWith(
      new Response(error.stack, {
        status: error.code,
      }),
    );
  }

  /**
   * Handle an HTTP request from the Deno server.
   *
   * @param originalRequest - The Deno request object.
   */
  async #handleRequest(
    originalRequest: Request,
    respondWith: (r: Response | Promise<Response>) => Promise<void>,
  ): Promise<void> {
    // Ordering of logic matters, because we dont want to spend time calculating
    // for something the user would never need, eg parsing the body for a user to never use it.
    // So here is what we do:
    //
    // 1. Create the request object (minimal impact)
    // 2. Get the resource using the request (minimal-medium impact, cant be avoided)
    // 3. Fail early if resource isnt found

    const resource = this.#handlers.resource_handler.getResource(
      originalRequest,
    );

    if (!resource) {
      console.error("NO RESOUCR WOW");
      throw new Drash.Errors.HttpError(404);
    }

    //const matchedParams = this.#handlers.resource_handler.getMatchedPathAndParams(new URL(originalRequest.url).pathname, resource.uri_paths)
    //console.log('matched params', matchedParams)

    // What we're going to do here is, we know we have a resource, now we just have to map
    // the path params on the resource paths to values in the uri
    const matchedParams = new Map();
    let pathname = new URL(originalRequest.url).pathname;
    if (pathname[pathname.length - 1] === "/") {
      pathname = pathname.slice(0, -1);
    }
    const pathnameSplit = pathname.split("/");
    for (const i in pathnameSplit) {
      // loop through until we reach an `:`, then use that as the name and the value from the uri
      for (const path of resource.paths) {
        const aplit = path.split("/");
        if (aplit[i] && aplit[i].includes(":")) {
          matchedParams.set(
            aplit[i].replace(":", "").replace("?", ""),
            pathnameSplit[i],
          );
        }
      }
    }

    const context = {
      request: await Drash.DrashRequest.create(originalRequest, matchedParams),
      response: new Drash.DrashResponse(
        this.#options.default_response_type as string,
        respondWith,
      ),
    };

    const method = context.request.method
      .toUpperCase() as Drash.Types.THttpMethod;

    // If the method does not exist on the resource, then the method is not
    // allowed. So, throw that 405 and GTFO.
    if (!(method in resource)) {
      throw new Drash.Errors.HttpError(405);
    }

    // Server before resource middleware
    if (this.#options.services) {
      for (const Service of this.#options.services) {
        await Service.runBeforeResource(context);
      }
    }

    // Class before resource middleware
    if (resource.services && resource.services.ALL) {
      for (const Service of resource.services.ALL) {
        await Service.runBeforeResource(context);
      }
    }

    // resource before middleware
    if (resource.services && resource.services[method]) {
      for (const Service of (resource.services[method] ?? [])) {
        await Service.runBeforeResource(context);
      }
    }

    // Execute the HTTP method on the resource
    await resource![method as Drash.Types.THttpMethod]!(context);

    // after resource middleware
    if (resource.services && method in resource.services) {
      for (const Service of (resource.services![method] ?? [])) {
        await Service.runAfterResource(context);
      }
    }

    // Class after resource middleware
    if (resource.services && resource.services.ALL) {
      for (const Service of resource.services!.ALL) {
        await Service.runAfterResource(context);
      }
    }

    if (this.#options.services) {
      for (const Service of this.#options.services) {
        await Service.runAfterResource(context);
      }
    }

    context.response.send();
  }

  /**
   * Listen for incoming requests.
   */
  async #listenForRequests() {
    for await (const conn of this.#deno_server) {
      (async () => {
        this.#httpConn = Deno.serveHttp(conn);
        for await (const { request, respondWith } of this.#httpConn) {
          try {
            await this.#handleRequest(request, respondWith);
          } catch (error) {
            await this.#handleError(error, respondWith);
          }
        }
      })();
    }
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

  #setOptions(
    options: Drash.Interfaces.IServerOptions,
  ): Drash.Interfaces.IServerOptions {
    if (!options.default_response_type) {
      options.default_response_type = "application/json";
    }

    if (!options.services) {
      options.services = [];
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
