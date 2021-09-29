import * as Drash from "../../mod.ts";

interface ResourceAndParams {
  resource: Drash.Resource;
  pathParams: Map<string, string>;
  searchParams: URLSearchParams;
}

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
   * A list of all instanced resources the user specified, and
   * a url pattern for every path specified. This means when a request
   * comes in, the paths are already converted to patterns, saving us time
   */
  #resources: Map<number, {
    resource: Drash.Resource;
    patterns: URLPattern[];
  }> = new Map();

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
    this.#options.resources.forEach((resourceClass) => {
      const resource = new resourceClass();
      const patterns: URLPattern[] = [];
      resource.paths.forEach((path) => {
        patterns.push(new URLPattern({ pathname: path + "{/}?" })); // match possible trailing slashes too
      });
      this.#resources.set(this.#resources.size, {
        resource,
        patterns,
      });
    });
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
        request: Request;
        respondWith: (request: Response | Promise<Response>) => Promise<void>;
      };
      await this.#handleRequest(evt.request, evt.respondWith);
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PRIVATE METHODS /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  #getResourceAndParams(
    url: string,
  ): ResourceAndParams | undefined {
    let resourceAndParams: ResourceAndParams | undefined = undefined;
    for (const { resource, patterns } of this.#resources.values()) {
      for (const pattern of patterns) {
        const result = pattern.exec(url);
        if (result === null) {
          continue;
        }
        // this is the resource we need, and below are the params
        const params = new Map();
        for (const key in result.pathname.groups) {
          params.set(key, result.pathname.groups[key]);
        }
        resourceAndParams = {
          resource,
          pathParams: params,
          searchParams: new URL(url).searchParams,
        };
        break;
      }
    }
    return resourceAndParams;
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

    const resourceAndParams = this.#getResourceAndParams(originalRequest.url);

    if (!resourceAndParams) {
      throw new Drash.Errors.HttpError(404);
    }

    const { resource, pathParams, searchParams } = resourceAndParams;

    const request = await Drash.Request.create(
      originalRequest,
      pathParams,
      searchParams,
    );
    const response = new Drash.Response(respondWith);

    const method = request.method
      .toUpperCase() as Drash.Types.THttpMethod;

    // If the method does not exist on the resource, then the method is not
    // allowed. So, throw that 405 and GTFO.
    if (!(method in resource)) {
      throw new Drash.Errors.HttpError(405);
    }

    // Server before resource middleware
    if (this.#options.services) {
      for (const Service of this.#options.services) {
        await Service.runBeforeResource(request, response);
      }
    }

    // Class before resource middleware
    if (resource.services && resource.services.ALL) {
      for (const Service of resource.services.ALL) {
        await Service.runBeforeResource(request, response);
      }
    }

    // resource before middleware
    if (resource.services && resource.services[method]) {
      for (const Service of (resource.services[method] ?? [])) {
        await Service.runBeforeResource(request, response);
      }
    }

    // Execute the HTTP method on the resource
    // Ignoring because we know by now the method exists due to the above check
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    await resource[method](request, response);

    // after resource middleware
    if (resource.services && method in resource.services) {
      for (const Service of (resource.services![method] ?? [])) {
        await Service.runAfterResource(request, response);
      }
    }

    // Class after resource middleware
    if (resource.services && resource.services.ALL) {
      for (const Service of resource.services!.ALL) {
        await Service.runAfterResource(request, response);
      }
    }

    // Server after resource services
    if (this.#options.services) {
      for (const Service of this.#options.services) {
        await Service.runAfterResource(request, response);
      }
    }

    const accept = request.headers.get("accept") ?? "";
    const contentType = response.headers.get("content-type") ?? "";
    if (accept.includes("*/*") === false) {
      if (accept.includes(contentType) === false) {
        throw new Drash.Errors.HttpError(
          406,
          Drash.Errors.DRASH_ERROR_CODES["D1009"],
        );
      }
    }

    response.send();
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
}
