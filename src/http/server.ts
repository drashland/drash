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
    if (!options.services) {
      options.services = [];
    }
    this.#options = options;
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
    (async () => {
      for (const service of this.#options.services ?? []) {
        await service.setUp();
      }
    })();
    if (this.#options.protocol === "http") {
      return this.#runHttp();
    }
    if (this.#options.protocol === "https") {
      return this.#runHttps();
    }
  }

  public runDeploy() {
    (async () => {
      for (const service of this.#options.services ?? []) {
        await service.setUp();
      }
    })();
    addEventListener("fetch", async (event) => {
      const evt = event as unknown as {
        request: Request,
        respondWith: (request: Response | Promise<Response>) => Promise<void>
      }
      await this.#handleRequest(evt.request, evt.respondWith)
    })
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PRIVATE METHODS /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

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

    const url = new URL(originalRequest.url);

    const resource = this.#handlers.resource_handler.getResource(
      url.pathname,
    );

    if (!resource) {
      throw new Drash.Errors.HttpError(404);
    }

    const pathnameSplit = url.pathname.split("/").filter((p) => p);
    const matchedParams = new Map();
    for (const resourcePath of resource.paths) {
      const resourcePathSplit = resourcePath.split("/").filter((p) => p);
      if (pathnameSplit.length > resourcePathSplit.length) { // uri is too long to match it, so it cant be the right one
        continue;
      }
      // What we're gonna do here is if an index on resource path is param, use the value from the pathname
      // using the same index, eg uri = /users/2/hello/bye, path = /users/:id/:text:text2 results in path = /users/2/hello/bye,
      // that way we can exact compare know 100% if its the right path
      for (const i in pathnameSplit) {
        const [value, name] = [resourcePathSplit[i], pathnameSplit[i]];
        if (value.includes(":")) {
          resourcePathSplit[i] = name;
          matchedParams.set(value.replace(/:|\?/g, ""), name);
        }
      }
      if (
        pathnameSplit.join("/") !==
          resourcePathSplit.filter((p) => !p.includes("?")).join("/")
      ) {
        matchedParams.clear();
        continue;
      }
      break; // we found the right one and have set the params
    }

    const context = {
      request: await Drash.DrashRequest.create(
        originalRequest,
        matchedParams,
        url,
      ),
      response: new Drash.DrashResponse(
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

    const accept = context.request.headers.get("accept") ?? "";
    const contentType = context.response.headers.get("content-type") ?? "";
    if (accept.includes("*/*") === false) {
      if (accept.includes(contentType) === false) {
        throw new Drash.Errors.HttpError(
          406,
          Drash.Errors.DRASH_ERROR_CODES["D1009"],
        );
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
            respondWith(
              new Response(error.stack, {
                status: error.code,
              }),
            );
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

  #getMimeType(body: BodyInit) {
    // check html and json first, as they are the most likely, no point in using time to
    // check xml, then plain, then pdf, THEN html and json

    // checks for strings
    if (typeof body === "string") {
      // html
      if (/<\/?[a-z][\s\S]*>/i.test(body)) {
        return "text/html";
      }
      // json
      try {
        JSON.parse(body);
        return "application/json";
      } catch (_e) {
        // do nothing
      }
      // javascript
      // css
      //xml
    }
  }
}
