import * as Drash from "../../mod.ts";
import { ConnInfo, StdServer } from "../../deps.ts";

interface ResourceAndParams {
  resource: Drash.Resource;
  pathParams: Map<string, string>;
}

type ResourcesAndPatterns = Map<number, {
  resource: Drash.Resource;
  patterns: URLPattern[];
}>;

function getResourceAndParams(
  url: string,
  resources: ResourcesAndPatterns,
): ResourceAndParams | undefined {
  let resourceAndParams: ResourceAndParams | undefined = undefined;
  for (const { resource, patterns } of resources.values()) {
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
      };
      break;
    }
  }
  return resourceAndParams;
}

async function runServices(
  Services: Drash.Service[],
  request: Drash.Request,
  response: Drash.Response,
  serviceMethod: "runBeforeResource" | "runAfterResource",
): Promise<{ err: Error | null; end: boolean }> {
  let err: Error | null = null;
  let end = false;
  for (const Service of Services) {
    try {
      await Service[serviceMethod](request, response);
      end = Service.send;
      if (end) {
        break;
      }
    } catch (e) {
      if (!err) {
        err = e;
      }
    }
  }
  return {
    end,
    err,
  };
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
  readonly #resources: ResourcesAndPatterns = new Map();

  /**
   * Our server instance that is serving the app
   */
  #server!: StdServer;

  /**
   * A promise we need to await after calling close() on #server
   */
  #serverPromise!: Promise<void>;

  /**
   * A custom Error object handler.
   */
  #error_handler!: Drash.Interfaces.IErrorHandler;

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
        // Add "{/}?" to match possible trailing slashes too
        patterns.push(new URLPattern({ pathname: path + "{/}?" }));
      });
      this.#resources.set(this.#resources.size, {
        resource,
        patterns,
      });
    });

    this.#error_handler = new (options.error_handler || Drash.ErrorHandler)();
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
      handler: this.#getHandler(),
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

  #getHandler(): (r: Request, connInfo: ConnInfo) => Promise<Response> {
    const resources = this.#resources;
    const serverServices = this.#options.services ?? [];
    const errorHandler = this.#error_handler;
    const defaultErrorHandler = new Drash.ErrorHandler();

    return async function (
      originalRequest: Request,
      connInfo: ConnInfo,
    ): Promise<Response> {
      // Grab resource and path params
      const resourceAndParams = getResourceAndParams(
        originalRequest.url,
        resources,
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

        let servicesResponse: {
          err: Error | null;
          end: boolean;
        } = {
          err: null,
          end: false,
        };

        // Server level services, run before resource
        servicesResponse = await runServices(
          serverServices,
          request,
          response,
          "runBeforeResource",
        );
        console.log("server services before res:", servicesResponse);
        // If error thrown, end lifecycle
        if (servicesResponse.err) {
          throw servicesResponse.err;
        }
        // Is a service wants to end, end lifeycycle
        if (servicesResponse.end) {
          return new Response(response.body, {
            headers: response.headers,
            statusText: response.statusText,
            status: response.status,
          });
        }

        // If no resource found, throw 404. Unable to call class/resource services
        // when the class doesn't exist!
        if (!resource) {
          throw new Drash.Errors.HttpError(404);
        }

        // Class before resource services
        servicesResponse = await runServices(
          resource.services.ALL ?? [],
          request,
          response,
          "runBeforeResource",
        );
        if (servicesResponse.err) {
          throw servicesResponse.err;
        }
        if (servicesResponse.end) {
          return new Response(response.body, {
            headers: response.headers,
            statusText: response.statusText,
            status: response.status,
          });
        }

        // If the method does not exist on the resource, then the method is not
        // allowed. So, throw that 405 and GTFO. Unable to call resource method
        // services if the method doesn't exist!
        const method = request.method
          .toUpperCase() as Drash.Types.THttpMethod;
        if (!(method in resource)) {
          throw new Drash.Errors.HttpError(405);
        }

        // resource before middleware
        servicesResponse = await runServices(
          resource.services[method] ?? [],
          request,
          response,
          "runBeforeResource",
        );
        if (servicesResponse.err) {
          throw servicesResponse.err;
        }
        if (servicesResponse.end) {
          return new Response(response.body, {
            headers: response.headers,
            statusText: response.statusText,
            status: response.status,
          });
        }

        console.log("calling resource");
        // Execute the HTTP method on the resource
        // Ignoring because we know by now the method exists due to the above check
        // deno-lint-ignore ban-ts-comment
        // @ts-ignore
        await resource[method](request, response);

        // after resource middleware
        servicesResponse = await runServices(
          resource.services[method] ?? [],
          request,
          response,
          "runAfterResource",
        );
        if (servicesResponse.err) {
          throw servicesResponse.err;
        }
        if (servicesResponse.end) {
          return new Response(response.body, {
            headers: response.headers,
            statusText: response.statusText,
            status: response.status,
          });
        }

        // Class after resource middleware. always run
        servicesResponse = await runServices(
          resource.services.ALL ?? [],
          request,
          response,
          "runAfterResource",
        );
        if (servicesResponse.err) {
          throw servicesResponse.err;
        }
        if (servicesResponse.end) {
          return new Response(response.body, {
            headers: response.headers,
            statusText: response.statusText,
            status: response.status,
          });
        }

        // Server after resource services. always run
        servicesResponse = await runServices(
          serverServices,
          request,
          response,
          "runAfterResource",
        );
        if (servicesResponse.err) {
          throw servicesResponse.err;
        }
        if (servicesResponse.end) {
          return new Response(response.body, {
            headers: response.headers,
            statusText: response.statusText,
            status: response.status,
          });
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
          await errorHandler.catch(e, originalRequest, response);
        } catch (e) {
          await defaultErrorHandler.catch(e, originalRequest, response);
        }

        return new Response(response.body, response);
      }
    };
  }
}
