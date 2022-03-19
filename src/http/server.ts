import * as Drash from "../../mod.ts";
import { ConnInfo, StdServer } from "../../deps.ts";

async function runServices(
  Services: Drash.Interfaces.IService[],
  request: Drash.Request,
  response: Drash.Response,
  serviceMethod: "runBeforeResource" | "runAfterResource",
): Promise<Error | null> {
  let err: Error | null = null;
  for (const Service of Services) {
    try {
      if (serviceMethod in Service) {
        await Service[serviceMethod]!(request, response);
      }
    } catch (e) {
      if (!err) {
        err = e;
      }
    }
  }
  return err;
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
  readonly #resources: Drash.Types.TResourcesAndPatterns = new Map();

  /**
   * Our server instance that is serving the app
   */
  #server!: StdServer;

  #services: Drash.Interfaces.IService[] = [];

  /**
   * A promise we need to await after calling close() on #server
   */
  #serverPromise!: Promise<void>;

  /**
   * A custom Error object handler.
   */
  #error_handler!: Drash.Interfaces.IErrorHandler;

  #default_error_handler = new Drash.ErrorHandler();

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
    this.#options = options;
    this.#options.resources.forEach((resourceClass) => {
      const resource = new resourceClass();
      const patterns: URLPattern[] = [];
      resource.paths.forEach((path) => {
        // Add "{/}?" to match possible trailing slashes too
        patterns.push(new URLPattern({ pathname: path + "{/}?" }));
      });
      this.#resources.set(this.#resources.size, {
        resource,
        patterns,
      });
    });

    this.#error_handler = new (options.error_handler || Drash.ErrorHandler)();

    // Compile the application. Add services first. Services may introduce
    // resources and those resources need to be present before we call
    // `this.#addResources()`.
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

  public addResource(resourceClass: typeof Drash.Resource): void {
    const resource = new resourceClass();
    const patterns: URLPattern[] = [];
    resource.paths.forEach((path) => {
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
      await this.#serverPromise;
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
      this.#serverPromise = this.#server.listenAndServe();
    }

    if (this.#options.protocol === "https") {
      this.#serverPromise = this.#server.listenAndServeTls(
        this.#options.cert_file as string,
        this.#options.key_file as string,
      );
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PRIVATE METHODS /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  #addServices(): void {
    if (this.#options.services) {
      this.#services = this.#options.services;
    }

    this.#services.forEach(async (service: Drash.Interfaces.IService) => {
      if (service.runAtStartup) {
        await service.runAtStartup({
          server: this,
          resources: this.#resources
        });
      }
    });
  }

  /**
   * Add all given resources to this server -- instantiating them so that they
   * are ready to handle requests at runtime.
   *
   * @param resources - Resources defined by the user.
   */
  #addResources(): void {
    this.#options.resources.forEach((resourceClass: typeof Drash.Resource) => {
      this.addResource(resourceClass);
    });
  }

  /**
   * Handle the given native request. This request gets wrapped around by a `Drash.Request` object. Reason being we want to make sure methods like `request.bodyAll()` is available in resources.
   *
   * @param originalRequest The native request from Deno's internals.
   * @param connInfo The connection info from Deno's internals.
   * @returns A native response.
   */
  async #handleRequest(
    originalRequest: Request,
    connInfo: ConnInfo,
  ): Promise<Response> {
    const serverServices = this.#options.services ?? [];

    // Grab resource and path params
    const resourceAndParams = this.#getResourceAndParams(
      originalRequest.url,
      this.#resources,
    ) ?? {
      resource: null,
      pathParams: new Map(),
    };

    const { resource, pathParams } = resourceAndParams;

    // Keep response outside of the try-catch so we can reuse the headers should an error be thrown
    // in the try block.
    const response = new Drash.Response();

    try {
      // Construct request and response objects to pass to services and resource.
      const request = await Drash.Request.create(
        originalRequest,
        pathParams,
        connInfo,
      );

      // If a service wants to respond early, then allow it, but do not run the resource method and still
      // allow services to run (e.g., CSRF, Paladin)
      let serviceError: Error | null = null;

      // Server level services, run before resource
      const serverBeforeServicesError = await runServices(
        serverServices,
        request,
        response,
        "runBeforeResource",
      );
      if (serverBeforeServicesError) {
        serviceError = serverBeforeServicesError;
      }

      // If no resource found, then still run server level services for after resource (e.g., Paladin),
      // then throw a 404
      if (!resource) {
        await runServices(
          serverServices,
          request,
          response,
          "runAfterResource",
        );
        throw new Drash.Errors.HttpError(404);
      }

      // If the method does not exist on the resource, then the method is not
      // allowed. So, throw that 405 and GTFO and still allow after resource server services to run.
      const method = request.method
        .toUpperCase() as Drash.Types.THttpMethod;
      if (!(method in resource)) {
        await runServices(
          serverServices,
          request,
          response,
          "runAfterResource",
        );
        throw new Drash.Errors.HttpError(405);
      }

      // By now, we all gucci, do run services and resource method as usual

      // Class before resource services
      const classBeforeServicesError = await runServices(
        resource.services.ALL ?? [],
        request,
        response,
        "runBeforeResource",
      );
      if (classBeforeServicesError && !serviceError) {
        serviceError = classBeforeServicesError;
      }

      // resource before middleware
      const resourceBeforeServicesError = await runServices(
        resource.services[method] ?? [],
        request,
        response,
        "runBeforeResource",
      );
      if (resourceBeforeServicesError && !serviceError) {
        serviceError = resourceBeforeServicesError;
      }

      if (serviceError == null) {
        // Execute the HTTP method on the resource
        // Ignoring because we know by now the method exists due to the above check
        // deno-lint-ignore ban-ts-comment
        // @ts-ignore
        await resource[method](request, response);
      }

      // after resource middleware. always run
      const resourceAfterServicesError = await runServices(
        resource.services[method] ?? [],
        request,
        response,
        "runAfterResource",
      );
      if (resourceAfterServicesError && !serviceError) {
        serviceError = resourceAfterServicesError;
      }

      // Class after resource middleware. always run
      const classAfterServicesError = await runServices(
        resource.services.ALL ?? [],
        request,
        response,
        "runAfterResource",
      );
      if (classAfterServicesError && !serviceError) {
        serviceError = classAfterServicesError;
      }

      // Server after resource services. always run
      const serverAfterServicesError = await runServices(
        serverServices,
        request,
        response,
        "runAfterResource",
      );
      if (serverAfterServicesError && !serviceError) {
        serviceError = serverAfterServicesError;
      }

      const accept = request.headers.get("accept") ?? "";
      const contentType = response.headers.get("content-type") ?? "";
      if (accept.includes("*/*") === false) {
        if (accept.includes(contentType) === false) {
          throw new Drash.Errors.HttpError(
            406,
            "The requested resource is only capable of returning content that is not acceptable according to the request's Accept headers.",
          );
        }
      }

      if (serviceError) {
        throw serviceError;
      }

      if (response.upgraded && response.upgraded_response) {
        return response.upgraded_response;
      }

      return new Response(response.body, {
        headers: response.headers,
        statusText: response.statusText,
        status: response.status,
      });
    } catch (e) {
      try {
        await this.#error_handler.catch(e, originalRequest, response);
      } catch (e) {
        await this.#default_error_handler.catch(e, originalRequest, response);
      }

      return new Response(response.body, response);
    }
  }

  #getResourceAndParams(
    url: string,
    resources: Drash.Types.TResourcesAndPatterns,
  ): Drash.Interfaces.IResourceAndParams | undefined {
    let resourceAndParams: Drash.Interfaces.IResourceAndParams | undefined =
      undefined;

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
        break;
      }
    }

    return resourceAndParams;
  }
}
