import { Drash } from "../../mod.ts";
import {
  HTTPOptions,
  HTTPSOptions,
  STATUS_TEXT,
  Server as DenoServer,
  Status,
  serve,
  serveTLS,
} from "../../deps.ts";

/**
 * @memberof Drash.Http
 * @class Server
 *
 * @description
 *     Server handles the entire request-resource-response lifecycle. It is in
 *     charge of handling HTTP requests to resources, static paths, sending
 *     appropriate responses, and handling any errors that bubble up within the
 *     request-resource-response lifecycle.
 */
export class Server {
  static REGEX_URI_MATCHES = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, "g");
  static REGEX_URI_REPLACEMENT = "([^/]+)";
  protected trackers = {
    requested_favicon: false,
  };

  /**
   * @description
   *     A property to hold the Deno server. This property is set in
   *     this.run() like so:
   *
   *         this.deno_server = serve(HTTPOptions);
   *
   *     serve() is imported from https://deno.land/x/http/server.ts.
   *
   * @property DenoServer deno_server
   */
  public deno_server: any;

  /**
   * @description
   *     The hostname of the Deno server.
   *
   * @property string hostname
   */
  public hostname: string = "localhost";

  /**
   * @description
   *     The port of the Deno server.
   *
   * @property number port
   */
  public port: number = 1447;

  /**
   * @description
   *     A property to hold this server's logger.
   *
   * @property Drash.Loggers.ConsoleLogger|Drash.Loggers.FileLogger logger
   */
  public logger: Drash.CoreLoggers.ConsoleLogger | Drash.CoreLoggers.FileLogger;

  /**
   * @description
   *     A property to hold this server's configs.
   *
   * @property any configs
   */
  protected configs: Drash.Interfaces.ServerConfigs;

  /**
   * @description
   *     A property to hold the location of this server on the filesystem. This
   *     property is used when resolving static paths.
   *
   * @property string|undefined directory
   */
  protected directory: string | undefined = undefined;

  /**
   * @description
   *     A property to hold middleware.
   *
   * @property any middleware
   */
  protected middleware: {
    before_request?: Array<
      ((request: any) => Promise<void>) | ((request: any) => void)
    >;
    after_request?: Array<
        | ((request: any, response: Drash.Http.Response) => Promise<void>)
        | ((request: any, response: Drash.Http.Response) => void)
    >;
  } = {};

  /**
   * @description
   *     A property to hold the resources passed in from the configs.
   *
   * @property any[] resources
   */
  protected resources: { [key: string]: Drash.Http.Resource } = {};

  /**
   * @description
   *     This server's list of static paths. HTTP requests to a static path are
   *     usually intended to retrieve some type of concrete resource (e.g., a
   *     CSS file or a JS file). If an HTTP request is matched to a static path
   *     and the resource the HTTP request is trying to get is found, then
   *     Drash.Http.Response will use its sendStatic() method to send the
   *     static asset back to the client.
   *
   * @property string[] static_paths
   */
  protected static_paths: string[] = [];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   *     Construct an object of this class.
   *
   * @param Drash.Interfaces.ServerConfigs configs
   *     See Drash.Interfaces.ServerConfigs
   */
  constructor(configs: Drash.Interfaces.ServerConfigs) {
    if (!configs.logger) {
      this.logger = new Drash.CoreLoggers.ConsoleLogger({
        enabled: false,
      });
    } else {
      this.logger = configs.logger;
    }

    this.configs = configs;

    if (configs.hasOwnProperty("middleware")) {
      this.addMiddleware(configs.middleware);
    }

    if (configs.resources) {
      configs.resources.forEach((resourceClass: Drash.Http.Resource) => {
        this.addHttpResource(resourceClass);
      });
      delete this.configs.resources;
    }

    if (!configs.memory_allocation) {
      configs.memory_allocation = {};
    }

    if (configs.static_paths) {
      this.directory = configs.directory; // blow up if this doesn't exist
      configs.static_paths.forEach((path: string) => {
        this.addStaticPath(path);
      });
    }

    if (configs.template_engine && !configs.views_path) {
      throw new Error(
        "Property missing. The views_path must be defined if template_engine is true",
      );
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   *     Get the request object with more properties and methods.
   *
   * @param any request
   *     The request object.
   *
   * @return any
   *     Returns any "request" object with more properties and methods that
   *     Drash uses. For example, deno uses the `ServerRequest` object; and this
   *     method takes that object and hydrates it with more properties and
   *     methods.
   */
  public async getRequest(request: any): Promise<any> {
    let options: any = {
      default_response_content_type: this.configs.response_output,
      headers: {
        base_url: this.hostname,
      },
      memory_allocation: {
        multipart_form_data: 10,
      },
    };
    const config: any = this.configs.memory_allocation;
    if (config && config.multipart_form_data) {
      options.memory_allocation.multipart_form_data =
        config.multipart_form_data;
    }
    request = await new Drash.Services.HttpRequestService().hydrate(
      request,
      options,
    );
    return request;
  }

  /**
   * @description
   *     Handle an HTTP request from the Deno server.
   *
   * @param any request
   *     The request object.
   *
   * @return Promise<any>
   *    See `Drash.Http.Response.send()`.
   */
  public async handleHttpRequest(request: any): Promise<any> {
    // Handle a request to a static path
    if (this.requestTargetsStaticPath(request)) {
      return this.handleHttpRequestForStaticPathAsset(request);
    }

    // Handle a request to the favicon
    if (request.url == "/favicon.ico") {
      return this.handleHttpRequestForFavicon(request);
    }

    let response: any;
    let resource: any;
    request = await this.getRequest(request);

    try {
      this.logger.info(
        `Request received: ${request.method.toUpperCase()} ${request.url}`,
      );

      let resourceClass = this.getResourceClass(request);

      await this.executeMiddlewareServerLevelBeforeRequest(request);

      // No resource? Send a 404 (Not Found) response.
      if (!resourceClass) {
        return this.handleHttpRequestError(
          request,
          this.httpErrorResponse(404),
        );
      }

      // @ts-ignore
      // (crookse)
      //
      // We ignore this because `resourceClass` could be `undefined`. `undefined`
      // doesn't have a construct signature and the compiler will complain about
      // it with the following error:
      //
      // TS2351: Cannot use 'new' with an expression whose type lacks a call or
      // construct signature.
      //
      resource = this.getResourceObject(resourceClass, request);
      request.resource = resource;
      this.logDebug(
        "Using `" + resource.constructor.name +
          "` resource class to handle the request.",
      );

      // Perform the request
      this.logDebug("Calling " + request.method.toUpperCase() + "().");
      if (typeof resource[request.method.toUpperCase()] !== "function") {
        throw new Drash.Exceptions.HttpException(405);
      }
      response = await resource[request.method.toUpperCase()]();

      await this.executeMiddlewareServerLevelAfterRequest(
        request,
        response,
      );

      // Send the response
      this.logDebug("Sending response. " + response.status_code + ".");
      return response.send();
    } catch (error) {
      this.logDebug(error.stack);
      return this.handleHttpRequestError(request, error, resource, response);
    }
  }

  /**
   * @description
   *     Handle cases when an error is thrown when handling an HTTP request.
   *
   * @param any request
   *     The request object.
   * @param any error
   *     The error object.
   * @param Drash.Http.Resource|any resource
   *     (optional) Pass in the resource that threw the error. If a resource
   *     wasn't created, then default to an empty object, which is why any is
   *     the assigned type.
   * @param Drash.Http.Response|any response
   *     (optional) Pass in the resource that threw the error. If a resource
   *     wasn't created, then default to an empty object, which is why any is
   *     the assigned type.
   *
   * @return any
   *     See `Drash.Http.Response.send()`.
   */
  public async handleHttpRequestError(
    request: any,
    error: any,
    resource: Drash.Http.Resource | any = {},
    response: Drash.Http.Response | any = {},
  ): Promise<any> {
    this.logDebug(
      `Error occurred while handling request: ${request.method} ${request.url}`,
    );
    this.logDebug(error.message);
    this.logDebug("Stack trace below:");
    this.logDebug(error.stack);

    this.logDebug("Generating generic error response object.");

    // If a resource was found, but an error occurred, then that's most likely
    // due to the HTTP method not being defined in the resource class;
    // therefore, the method is not allowed. In this case, we send a 405
    // (Method Not Allowed) response.
    if (resource) {
      if (!response) {
        if (typeof resource[request.method.toUpperCase()] !== "function") {
          error = new Drash.Exceptions.HttpException(405);
        }
      }
    }

    response = new Drash.Http.Response(request, {
      views_path: this.configs.views_path,
      template_engine: this.configs.template_engine,
    });
    response.status_code = error.code ? error.code : null;
    response.body = error.message ? error.message : response.getStatusMessage();

    this.logDebug(
      `Sending response. Content-Type: ${response.headers.get(
        "Content-Type",
      )}. Status: ${response.getStatusMessageFull()}.`,
    );

    try {
      await this.executeMiddlewareServerLevelAfterRequest(
        request,
        response,
      );
    } catch (error) {
      // Do nothing. The `executeMiddlewareServerLevelAfterRequest()` method is
      // run once in `handleHttpRequest()`. We run this method a second time
      // here in case the server has middleware that needs to run (e.g.,
      // logging middleware) without throwing uncaught exceptions. This is a bit
      // hacky, but it works. Refactor when needed.
    }

    return response.send();
  }

  /**
   * @description
   *     Handle HTTP requests for the favicon. This method only exists to
   *     short-circuit favicon requests--preventing the requests from clogging
   *     the logs.
   *
   * @param any request
   *
   * @return string
   *     Returns the response as stringified JSON. This is only used for unit
   *     testing purposes.
   */
  public handleHttpRequestForFavicon(request: any): string {
    const headers = new Headers();
    headers.set("Content-Type", "image/x-icon");

    const response = new Drash.Http.Response(request);
    response.status_code = 200;
    response.headers = headers;

    try {
      const body = Deno.readFileSync(`${Deno.realPathSync(".")}/favicon.ico`);
      response.body = body;
      if (!this.trackers.requested_favicon) {
        this.trackers.requested_favicon = true;
        this.logDebug("/favicon.ico requested.");
        if (!body) {
          this.logDebug("/favicon.ico was not found.");
        } else {
          this.logDebug("/favicon.ico was found.");
        }
        this.logDebug(
          "All future log messages for /favicon.ico will be muted.",
        );
      }
    } catch (error) {
      response.body = "";
    }

    request.respond(response);
    return JSON.stringify(response);
  }

  /**
   * @description
   *     Handle HTTP requests for static path assets.
   *
   * @param any request
   *
   * @return any
   *     Returns the response as stringified JSON. This is only used for unit
   *     testing purposes.
   */
  public handleHttpRequestForStaticPathAsset(request: any): any {
    try {
      const response = new Drash.Http.Response(request, {
        views_path: this.configs.views_path,
        template_engine: this.configs.template_engine,
      });

      if (this.configs.pretty_links == null) {
        return response.sendStatic(`${this.directory}/${request.url_path}`);
      }

      const extension = request.url_path.split(".")[1];
      if (extension != null) {
        return response.sendStatic(`${this.directory}/${request.url_path}`);
      }

      const contents = Deno.readFileSync(
        `${this.directory}/${request.url_path}/index.html`,
      );
      if (contents == null) {
        return response.sendStatic(`${this.directory}/${request.url_path}`);
      }

      response.headers.set("Content-Type", "text/html");
      return response.sendStatic(null, contents);
    } catch (error) {
      return this.handleHttpRequestError(request, this.httpErrorResponse(404));
    }
  }

  /**
   *
   * @param resourceClass
   * @param request
   *
   * @return resourceClass
   *     Returns an instance of the resourceClass passed in, and setting the
   *     `paths` and `middleware` properties
   */
  public getResourceObject(
    resourceClass: any,
    request: any,
  ): Drash.Http.Resource {
    const resourceObj: Drash.Http.Resource = new resourceClass(
      request,
      new Drash.Http.Response(request, {
        views_path: this.configs.views_path,
        template_engine: this.configs.template_engine,
      }),
      this,
    );
    // We have to add the static properties back because they get blown away
    // when the resource object is created
    resourceObj.paths = resourceClass.paths;
    resourceObj.middleware = resourceClass.middleware;
    return resourceObj;
  }

  /**
   * @description
   *     Run the Deno server at the hostname specified in the configs. This
   *     method takes each HTTP request and creates a new and more workable
   *     request object and passes it to
   *     `Drash.Http.Server.handleHttpRequest()`.
   *
   * @param HTTPOptions options
   *     The HTTPOptions interface from https://deno.land/std/http/server.ts.
   *
   * @return Promise<DenoServer>
   *     Returns the Deno server from the serve() call.
   */
  public async run(options: HTTPOptions): Promise<DenoServer> {
    if (!options.hostname) {
      options.hostname = this.hostname;
    }
    if (!options.port) {
      options.port = this.port;
    }
    this.hostname = options.hostname;
    this.port = options.port;
    this.deno_server = serve(options);
    (async () => {
      for await (const request of this.deno_server) {
        try {
          this.handleHttpRequest(request);
        } catch (error) {
          this.handleHttpRequestError(request, this.httpErrorResponse(500));
        }
      }
    })();
    return this.deno_server;
  }

  /**
   * @description
   *     Run the Deno server at the hostname specified in the configs as an
   *     HTTPS Server. This method takes each HTTP request and creates a new and
   *     more workable request object and passes it to
   *     `Drash.Http.Server.handleHttpRequest()`.
   *
   * @param HTTPSOptions options
   *     The HTTPSOptions interface from https://deno.land/std/http/server.ts.
   *
   * @return Promise<DenoServer>
   *     Returns the Deno server from the serveTLS() call.
   */
  public async runTLS(options: HTTPSOptions): Promise<DenoServer> {
    if (!options.hostname) {
      options.hostname = this.hostname;
    }
    if (!options.port) {
      options.port = this.port;
    }
    this.hostname = options.hostname;
    this.port = options.port;
    this.deno_server = serveTLS(options);
    (async () => {
      for await (const request of this.deno_server) {
        try {
          this.handleHttpRequest(request);
        } catch (error) {
          this.handleHttpRequestError(request, this.httpErrorResponse(500));
        }
      }
    })();
    return this.deno_server;
  }

  /**
   * @description
   *     Close the server.
   */
  public close(): void {
    this.deno_server.close();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   *     Add an HTTP resource to the server which can be retrieved at specific
   *     URIs.
   *
   *     Drash defines an HTTP resource according to the MDN Web docs
   *     [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web).
   *
   * @param Drash.Http.Resource resourceClass
   *     A child object of the `Drash.Http.Resource` class.
   *
   * @return void
   *     This method just adds `resourceClass` to `this.resources` so it can be
   *     used (if matched) during an HTTP request.
   */
  protected addHttpResource(resourceClass: Drash.Http.Resource): void {
    const newPaths = [];
    for (const path of resourceClass.paths) {
      if (typeof path != "string") {
        newPaths.push(path);
        continue;
      }

      if (path.includes("*") == true) {
        // Wildcard
        const pathObj = {
          og_path: path,
          regex_path: `^.${path.replace(
            Server.REGEX_URI_MATCHES,
            Server.REGEX_URI_REPLACEMENT,
          )}/?$`,
          params: (path.match(Server.REGEX_URI_MATCHES) || []).map(
            (element: string) => {
              return element.replace(/:|{|}/g, "");
            },
          ),
        };

        newPaths.push(pathObj);
      } else {
        const pathObj = {
          og_path: path,
          regex_path: `^${path.replace(
            Server.REGEX_URI_MATCHES,
            Server.REGEX_URI_REPLACEMENT,
          )}/?$`,
          params: (path.match(Server.REGEX_URI_MATCHES) || []).map(
            (element: string) => {
              return element.replace(/:|{|}/g, "");
            },
          ),
        };
        newPaths.push(pathObj);
      }
    }

    resourceClass.paths = newPaths;

    // Store the resource so it can be retrieved when requested
    this.resources[resourceClass.name] = resourceClass;
  }

  /**
   * @description
   *     Add server-level and resource-level middleware.
   *
   * @param any middleware
   *
   * @return void
   */
  protected addMiddleware(middlewares: any): void {
    // Add server-level middleware
    if (middlewares.before_request != null) {
      this.middleware.before_request = [];
      for (const middleware of middlewares.before_request) {
        this.middleware.before_request.push(middleware);
      }
    }
    if (middlewares.after_request != null) {
      this.middleware.after_request = [];
      for (const middleware of middlewares.after_request) {
        this.middleware.after_request.push(middleware);
      }
    }
  }

  /**
   * @description
   *     Add a static path for serving static assets like CSS files, JS files,
   *     PDF files, etc.
   *
   * @param string path
   *
   * @return void
   *     This method just adds `path` to `this.static_paths` so it can be used (if
   *     matched) during an HTTP request.
   */
  protected addStaticPath(path: string): void {
    this.static_paths.push(path);
  }

  /**
   * @description
   *     Execute server-level middleware before the request.
   *
   * @param any request
   *     The request object.
   * @param Drash.Http.Resource resource
   *     The resource object.
   *
   * @return void
   */
  protected async executeMiddlewareServerLevelBeforeRequest(
    request: any,
  ): Promise<void> {
    // Execute server-level middleware
    if (this.middleware.before_request != null) {
      for (const middleware of this.middleware.before_request) {
        await middleware(request);
      }
    }
  }

  /**
   * @description
   *     Execute server-level middleware after the request.
   *
   * @param any request
   *     The request object.
   * @param Drash.Http.Resource resource
   *     The resource object.
   *
   * @return void
   */
  protected async executeMiddlewareServerLevelAfterRequest(
    request: any,
    response: Drash.Http.Response | null,
  ): Promise<void> {
    if (this.middleware.after_request != null) {
      for (const middleware of this.middleware.after_request) {
        await middleware(request, response!);
      }
    }
  }

  /**
   * Get an HTTP error response exception object.
   *
   * @param number code
   *
   * @return Drash.Exceptions.HttpException
   */
  protected httpErrorResponse(code: number): Drash.Exceptions.HttpException {
    return new Drash.Exceptions.HttpException(code);
  }

  /**
   * @description
   *     Get the resource class.
   *
   * @param any request
   *     The request object.
   *
   * @return Drash.Http.Resource|undefined
   *     Returns a `Drash.Http.Resource` object if the URL path of the request
   *     can be matched to a `Drash.Http.Resource` object's paths.
   *
   *     Returns `undefined` if a `Drash.Http.Resource` object can't be matched.
   */
  protected getResourceClass(request: any): Drash.Http.Resource | undefined {
    for (const resourceName in this.resources) {
      const resource = this.resources[resourceName];

      for (const pathObj of resource.paths) {
        if (pathObj.og_path === "/" && request.url_path === "/") {
          return resource;
        }

        const pathMatchesRequestPathname = request.url_path.match(
          pathObj.regex_path,
        );
        if (pathMatchesRequestPathname == null) {
          continue;
        }

        pathMatchesRequestPathname.shift();
        const pathParamsInKvpForm: any = {};
        pathObj.params.forEach((paramName: string, index: number) => {
          pathParamsInKvpForm[paramName] = pathMatchesRequestPathname[index];
        });

        request.path_params = pathParamsInKvpForm;
        return resource;
      }
    }
    return undefined;
  }

  /**
   * @description
   *     Is the request targeting a static path?
   *
   * @param any request
   *
   * @return boolean
   *     Returns true if the request targets a static path.
   */
  protected requestTargetsStaticPath(request: any): boolean {
    if (this.static_paths.length <= 0) {
      return false;
    }
    // If the request URL is "/public/assets/js/bundle.js", then we take out
    // "/public" and use that to check against the static paths
    const staticPath = request.url.split("/")[1];
    // Prefix with a leading slash, so it can be matched properly
    const requestUrl = `/${staticPath}`;

    if (this.static_paths.indexOf(requestUrl) == -1) {
      return false;
    }

    request = new Drash.Services.HttpRequestService().hydrate(request, {
      headers: {
        "Response-Content-Type": new Drash.Services.HttpService().getMimeType(
          request.url,
          true,
        ),
      },
    });
    return true;
  }

  /**
   * @description
   *     Log a debug message
   *
   * @param string message
   *     Message to log
   *
   * @return void
   */
  protected logDebug(message: string): void {
    this.logger.debug("[syslog] " + message);
  }
}
