import * as Drash from "../../mod.ts";
import { StdServer } from "../../deps.ts";

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
): Promise<Error | null> {
  let err: Error | null = null;
  for (const Service of Services) {
    try {
      await Service[serviceMethod](request, response);
    } catch (e) {
      if (!e) {
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
  public async close(): Promise<void> {
    try {
      this.#server.close();
      await this.#serverPromise;
    } catch (_error) {
      // Do nothing. The server was probably already closed.
    }
  }

  /**
   * Start the server using the p
   */
  public run() {
    const addr = `${this.#options.hostname}:${this.#options.port}`;
    this.#server = new StdServer({ addr, handler: this.#getHandler() });
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

  public runDeploy() {
    addEventListener("fetch", async (event) => {
      const evt = event as unknown as {
        request: Request;
        respondWith: (request: Response | Promise<Response>) => Promise<void>;
      };
      await this.#getHandler()(evt.request);
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PRIVATE METHODS /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  #getHandler(): (r: Request) => Promise<Response> {
    const resources = this.#resources;
    const serverServices = this.#options.services ?? [];
    return async function (originalRequest: Request) {
      try {
        // If a service wants to respond early, then allow it but dont run the resource method and still
        // allow services to run eg csrf, paladin
        let serviceError: Error | null = null;

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
        const request = await Drash.Request.create(
          originalRequest,
          pathParams,
        );
        const response = new Drash.Response();

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

        // If no resource found, then still run server level services for after resource eg paladin,
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
        // allowed. So, throw that 405 and GTFO and still allow after reosurce server services to run
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
              "The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request",
            );
          }
        }

        if (serviceError) {
          throw serviceError;
        }

        return new Response(response.body, {
          headers: response.headers,
          statusText: response.statusText,
          status: response.status,
        });
      } catch (e) {
        return new Response(e.stack, {
          status: e.code,
        });
      }
    };
  }
}
