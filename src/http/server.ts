import * as Drash from "../../mod.ts";

// TODO(crookse) Remove this. We don't need this. Just set the services
// accordingly. I don't know what that means right now, but maybe I'll know what
// that means later.
interface IServices {
  external: {
    after_request: Drash.Interfaces.IService[];
    before_request: Drash.Interfaces.IService[];
  };
}

/**
 * This class handles the entire request-resource-response lifecycle. It is in
 * charge of handling incoming requests, matching them to resources for further
 * processing, and sending responses based on the processes set in the resource.
 * It is also in charge of sending error responses that "bubble up" during the
 * request-resource-response lifecycle.
 */
export class Server implements Drash.Interfaces.IServer {
  /**
   * See Drash.Interfaces.IServerOptions.
   */
  public options: Drash.Interfaces.IServerOptions = {};

  /**
   * The Deno server object (after calling `serve()`).
   */
  // @ts-ignore: See mod.ts TS IGNORE NOTES > NOTE 1.
  protected deno_server: Drash.Deps.Server;

  /**
   * The Deno server request object handler. This handler gets wrapped around
   * the Deno server request object and acts as a proxy to interact with the
   * Deno server request object.
   *
   * The Drash.Request object is not actually a request object. Surprise!
   */
  protected handlers: Drash.Interfaces.IHandlers = {
    resource_handler: Drash.Factory.create(Drash.ResourceHandler),
  };

  /**
   * The internal and external services used by this server. Internal services
   * are ones created by Drash. External services are ones specified by the
   * user.
   */
  protected services: IServices = {
    external: {
      after_request: [],
      before_request: [],
    },
  };

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - FACTORY METHODS /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * See Drash.Interfaces.ICreateable.addOptions().
   */
  public addOptions(options: Drash.Interfaces.IServerOptions): void {
    if (!options.default_response_content_type) {
      options.default_response_content_type = "application/json";
    }

    if (!options.hostname) {
      options.hostname = "0.0.0.0";
    }

    if (!options.memory) {
      options.memory = {};
    }

    if (!options.memory.multipart_form_data) {
      options.memory.multipart_form_data = 10;
    }

    if (!options.port) {
      options.port = 1337;
    }

    if (!options.resources) {
      options.resources = [];
    }

    if (!options.services) {
      options.services = {
        after_request: [],
        before_request: [],
      };
    }

    this.options = options;
  }

  /**
   * See Drash.Interfaces.ICreateable.create().
   */
  public create(): void {
    this.addExternalServices();
    this.addResources();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Close the server.
   */
  public close(): void {
    try {
      this.deno_server.close();
    } catch (_error) {
      // Do nothing. The server was probably already closed.
    }
  }

  /**
   * Get the full address that this server is running on.
   *
   * @returns The address (e.g., https://localhost:1337).
   */
  public getAddress(): string {
    return `${this.options.protocol}://${this.options.hostname}:${this.options.port}`;
  }

  /**
   * Handle errors thrown during runtime. These errors get sent as the response
   * to the client.
   *
   * @param request - The request object.
   * @param error - The error that was thrown during runtime.
   */
  public handleError(
    request: Drash.Deps.ServerRequest,
    error: Drash.Errors.HttpError,
  ) {
    // TODO(crookse) The error should be a response object so we can
    // request.respond(error);
    request.respond({
      status: error.code,
      body: error.stack,
    });
  }

  /**
   * Handle an HTTP request from the Deno server.
   *
   * TODO (crookse) Add in the middleware. Middleware is now called serices. So,
   * technically, add in the services.
   *
   * @param originalRequest - The Deno request object.
   */
  public async handleRequest(
    originalRequest: Drash.Deps.ServerRequest,
  ): Promise<any> {
    const request = await this.buildRequest(originalRequest);
    const resource = this.handlers.resource_handler.createResource(
      request,
    );

    // if (!resource) {
    //   throw new Drash.Errors.HttpError(404);
    // }

    request.setPathParams(resource);

    const method = request.method.toUpperCase();

    // If the method does not exist on the resource, then the method is not
    // allowed. So, throw that 405 and GTFO.
    if (!(method in resource)) {
      throw new Drash.Errors.HttpError(405);
    }

    const response = await resource![method as Drash.Types.THttpMethod]!();
    const body = await response.parseBody();

    originalRequest.respond({
      status: response.status,
      headers: response.headers,
      body: body,
    });
  }

  /**
   * Run the server in HTTP mode.
   *
   * @returns The Deno server object.
   */
  public async runHttp(): Promise<Drash.Deps.Server> {
    this.options.protocol = "http";

    this.deno_server = Drash.Deps.serve({
      hostname: this.options.hostname!,
      port: this.options.port!,
    });

    await this.listenForRequests();

    return this.deno_server;
  }

  /**
   * Run the server in HTTPS mode.
   *
   * @returns The Deno server object.
   */
  public async runHttps(): Promise<Drash.Deps.Server> {
    this.options.protocol = "https";

    this.deno_server = Drash.Deps.serveTLS({
      hostname: this.options.hostname!,
      port: this.options.port!,
      certFile: this.options.cert_file!,
      keyFile: this.options.key_file!,
    });

    await this.listenForRequests();

    return this.deno_server;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROTECTED METHODS ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add the external services passed in via options.
   */
  protected async addExternalServices(): Promise<void> {
    // No services? GTFO.
    if (!this.options.services) {
      return;
    }

    // Add server-level services that execute before all requests
    if (this.options.services.before_request) {
      await this.addExternalServicesBeforeRequest(
        this.options.services.before_request,
      );
    }

    // Add server-level services that execute after all requests
    if (this.options.services.after_request) {
      await this.addExternalServicesAfterRequest(
        this.options.services.after_request,
      );
    }
  }

  /**
   * Add the external services that should execute after a request.
   *
   * @param services - An array of Service types.
   */
  protected async addExternalServicesAfterRequest(
    services: typeof Drash.Service[],
  ): Promise<void> {
    for (const s of services) {
      // TODO(crookse) Make this new call use the Factory.
      // @ts-ignore
      const service = new (s as Drash.Interfaces.IService)();
      // Check if this service needs to be set up
      if (service.setUp) {
        await service.setUp();
      }
      this.services.external.after_request!.push(service);
    }
  }

  /**
   * Add the external services that should execute before a request.
   *
   * @param services - An array of Service types.
   */
  protected async addExternalServicesBeforeRequest(
    services: typeof Drash.Service[],
  ): Promise<void> {
    for (const s of services) {
      // TODO(crookse) Make this new call use the Factory.
      // @ts-ignore
      const service = new (s as Drash.Interfaces.IService)();
      // Check if this service needs to be set up
      if (service.setUp) {
        await service.setUp();
      }
      this.services.external.before_request!.push(service);
    }
  }


  /**
   * Build the request object.
   *
   * @param originalRequest - Deno's request object.
   *
   * @returns See Drash.Request.
   */
  protected async buildRequest(
    originalRequest: Drash.Deps.ServerRequest,
  ): Promise<Drash.Request> {
    return await this.request.clone({
      original_request: originalRequest,
      memory: {
        multipart_form_data: this.options.memory!.multipart_form_data!,
      },
    });
  }

  /**
   * Execute server-level services after the request.
   *
   * @param request - The request object.
   * @param resource - The resource object.
   */
  // protected async executeApplicationServicesAfterRequest(
  //   request: any,
  //   response: Response,
  // ): Promise<void> {
  //   if (!this.services.external.after_request) {
  //     return;
  //   }

  //   for (const index in this.services.external.after_request) {
  //     const service = this.services.external.after_request[index];
  //     if (service.runAfterRequest) {
  //       service.runAfterRequest(request, response);
  //     }
  //   }
  // }

  /**
   * Execute server-level services before the request.
   *
   * @param request - The request object.
   * @param resource - The resource object.
   */
  // protected async executeApplicationServicesBeforeRequest(
  //   request: Request,
  // ): Promise<void> {
  //   if (!this.services.external.before_request) {
  //     return;
  //   }

  //   for (const index in this.services.external.before_request) {
  //     const service = this.services.external.before_request[index];
  //     if (service.runBeforeRequest) {
  //       service.runBeforeRequest(request);
  //     }
  //   }
  // }

  /**
   * Listens for incoming HTTP connections on the server property
   */
  protected async listenForRequests() {
    for await (const request of this.deno_server) {
      try {
        await this.handleRequest(request);
      } catch (error) {
        await this.handleError(request, error);
      }
    }
  }
}
