import * as Drash from "../../mod.ts";
import { ConnInfo, StdServer } from "../../deps.ts";

async function runServices(
  Services: Drash.Interfaces.IService[],
  request: Drash.Request,
  response: Drash.Response,
  serviceMethod: "runBeforeResource" | "runAfterResource",
): Promise<void> {
  // There are two ways a service can short-circuit the
  // request-resource-response lifecycle:
  //
  //   1. The service throws an error.
  //   2. The service calls `request.end()`.
  //
  // If the service throws an error, then the request handler we pass in to `new
  // StdServer()` will catch it and return a response.
  //
  // If the service calls `request.end()`, then the request handler we pass in
  // to `new StdServer()` will return `new Response()`.
  for (const Service of Services) {
    if (serviceMethod in Service) {
      await Service[serviceMethod]!(request, response);
      if (request.end_lifecycle) {
        break;
      }
    }
  }
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
   * A list of all instanced resources the user specified, and
   * a url pattern for every path specified. This means when a request
   * comes in, the paths are already converted to patterns, saving us time
   */
  readonly #resources: Drash.Types.ResourcesAndPatternsMap = new Map();

  /**
   * Our server instance that is serving the app
   */
  #server!: StdServer;

  /**
   * All services that provide extra functionality to the server and the overall
   * application.
   */
  #services: Drash.Interfaces.IService[] = [];

  /**
   * A promise we need to await after calling close() on #server
   */
  #server_promise!: Promise<void>;

  /**
   * A custom Error object handler.
   */
  #error_handler!: Drash.Interfaces.IErrorHandler;

  /**
   * The error handler to use in the event `this.#error_handler` cannot handle
   * errors.
   */
  #default_error_handler = new Drash.ErrorHandler();

  /**
   * Property to track request URLs to resources. This is used so that the
   * server does not have to find a resource if it was already matched to a
   * previous request's URL.
   */
  #request_to_resource_map = new Map<
    string,
    Drash.Interfaces.IResourceAndParams
  >();

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param options - See the interface for the options' schema.
   */
  constructor(options: Drash.Interfaces.IServerOptions) {
    this.#options = options;
    this.#error_handler = new (options.error_handler || Drash.ErrorHandler)();

    // Compile the application
    this.#addServices();
    this.#addResources();
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
   * Add the given resource to this server's list of resources.
   *
   * @param resourceClass - The resource class to instantiate and store in the
   * resources map.
   */
  public addResource(resourceClass: typeof Drash.Resource): void {
    const resource = new resourceClass();
    const patterns: URLPattern[] = [];
    resource.paths.forEach((path: string) => {
      // Add "{/}?" to match possible trailing slashes too
      patterns.push(new URLPattern({ pathname: path + "{/}?" }));
    });
    this.#resources.set(this.#resources.size, {
      resource,
      patterns,
    });
  }

  /**
   * Close the server.
   */
  public async close(): Promise<void> {
    try {
      this.#server.close();
      await this.#server_promise;
    } catch (_error) {
      // Do nothing. The server was probably already closed.
    }
  }

  /**
   * Run the server.
   */
  public run() {
    this.#server = new StdServer({
      hostname: this.#options.hostname,
      port: this.#options.port,
      handler: async (originalRequest: Request, connInfo: ConnInfo) => {
        return await this.#handleRequest(originalRequest, connInfo);
      },
    });

    if (this.#options.protocol === "http") {
      this.#server_promise = this.#server.listenAndServe();
    }

    if (this.#options.protocol === "https") {
      this.#server_promise = this.#server.listenAndServeTls(
        this.#options.cert_file as string,
        this.#options.key_file as string,
      );
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add all resources to this server -- instantiating them so that they
   * are ready to handle requests at runtime.
   */
  #addResources(): void {
    this.#options.resources.forEach((resourceClass: typeof Drash.Resource) => {
      this.addResource(resourceClass);
    });
  }

  /**
   * Add all given services in the options.
   */
  #addServices(): void {
    if (this.#options.services) {
      this.#services = this.#options.services;
    }

    this.#services.forEach(async (service: Drash.Interfaces.IService) => {
      if (service.runAtStartup) {
        await service.runAtStartup({
          server: this,
          resources: this.#resources,
        });
      }
    });
  }

  /**
   * Get the resource associated with the given URL and its path params
   * associated with it.
   *
   * @param url - The URL to match to a resource.
   * @param resources - The resources map to use to find the resource.
   */
  #getResourceAndParams(
    url: string,
    resources: Drash.Types.ResourcesAndPatternsMap,
  ): Drash.Interfaces.IResourceAndParams | undefined {
    let resourceAndParams: Drash.Interfaces.IResourceAndParams | undefined =
      undefined;

    if (this.#request_to_resource_map.has(url)) {
      return this.#request_to_resource_map.get(url)!;
    }

    for (const { resource, patterns } of resources.values()) {
      for (const pattern of patterns) {
        const result = pattern.exec(url);

        // No resource? Check the next one.
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
        };

        this.#request_to_resource_map.set(url, resourceAndParams);
        break;
      }
    }

    return resourceAndParams;
  }

  /**
   * Handle the given native request. This request gets wrapped around by a
   * `Drash.Request` object. Reason being we want to make sure methods like
   * `request.bodyAll()` is available in resources.
   *
   * @param originalRequest The native request from Deno's internals.
   * @param connInfo The connection info from Deno's internals.
   *
   * @returns A native response.
   */
  async #handleRequest(
    originalRequest: Request,
    connInfo: ConnInfo,
  ): Promise<Response> {
    // Grab resource and path params
    const resourceAndParams = this.#getResourceAndParams(
      originalRequest.url,
      this.#resources,
    ) ?? {
      resource: null,
      pathParams: new Map(),
    };

    const { resource, pathParams } = resourceAndParams;

    // Construct request and response objects to pass to services and resource
    // Keep response top level so we can reuse the headers should an error be thrown
    // in the try
    const response = new Drash.Response();
    try {
      const request = await Drash.Request.create(
        originalRequest,
        pathParams,
        connInfo,
      );

      // Run server-level services (before we get to the resource)
      await runServices(
        this.#services,
        request,
        response,
        "runBeforeResource",
      );

      if (request.end_lifecycle) {
        return this.#respond(response);
      }

      // If no resource found, throw 404. Unable to call class/resource services
      // when the class doesn't exist!
      if (!resource) {
        throw new Drash.Errors.HttpError(404);
      }

      // Run resource-level services (before their HTTP method is called)
      await runServices(
        resource.services.ALL ?? [],
        request,
        response,
        "runBeforeResource",
      );

      if (request.end_lifecycle) {
        return this.#respond(response);
      }

      // If the method does not exist on the resource, then the method is not
      // allowed. So, throw that 405 and GTFO. Unable to call resource method
      // services if the method doesn't exist!
      const method = request.method
        .toUpperCase() as Drash.Types.HttpMethodName;
      if (!(method in resource)) {
        throw new Drash.Errors.HttpError(405);
      }

      // Run resource HTTP method level services (before the HTTP method is
      // called)
      await runServices(
        resource.services[method] ?? [],
        request,
        response,
        "runBeforeResource",
      );

      if (request.end_lifecycle) {
        return this.#respond(response);
      }

      // Execute the HTTP method on the resource
      // Ignoring because we know by now the method exists due to the above check
      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      await resource[method](request, response);

      // Run resource HTTP method level services (after the HTTP method is
      // called)
      await runServices(
        resource.services[method] ?? [],
        request,
        response,
        "runAfterResource",
      );

      if (request.end_lifecycle) {
        return this.#respond(response);
      }

      // Run resource-level services (after the HTTP method is called)
      await runServices(
        resource.services.ALL ?? [],
        request,
        response,
        "runAfterResource",
      );

      if (request.end_lifecycle) {
        return this.#respond(response);
      }

      // Run server-level services as a last step before returning a response
      // that the resource has formed
      await runServices(
        this.#services,
        request,
        response,
        "runAfterResource",
      );

      if (request.end_lifecycle) {
        return this.#respond(response);
      }

      const requestAcceptHeader = request.headers.get("accept");
      const responseContentTypeHeader = response.headers.get("content-type");

      if (requestAcceptHeader && responseContentTypeHeader) {
        this.#verifyAcceptHeader(
          requestAcceptHeader,
          responseContentTypeHeader,
        );
      }

      return this.#respond(response);
    } catch (e) {
      try {
        await this.#error_handler.catch(e, originalRequest, response);
      } catch (e) {
        await this.#default_error_handler.catch(e, originalRequest, response);
      }

      return this.#respond(response);
    }
  }

  /**
   * Respond to the client making the request.
   *
   * @param response The response details to use in the `Response` object.
   *
   * @returns A native Response.
   */
  #respond(response: Drash.Response): Response {
    if (response.upgraded && response.upgraded_response) {
      return response.upgraded_response;
    }

    return new Response(response.body, {
      headers: response.headers,
      statusText: response.statusText,
      status: response.status,
    });
  }

  /**
   * If the request Accept header is present, then make sure the response
   * Content-Type header is accepted.
   *
   * @param requestAcceptHeader
   * @param responseContentTypeHeader
   */
  #verifyAcceptHeader(
    requestAcceptHeader: string,
    responseContentTypeHeader: string,
  ): void {
    if (requestAcceptHeader.includes("*/*")) {
      return;
    }

    if (requestAcceptHeader.includes(responseContentTypeHeader)) {
      return;
    }

    throw new Drash.Errors.HttpError(
      406,
      "The requested resource is only capable of returning content that is not acceptable according to the request's Accept headers.",
    );
  }
}
