import { Drash } from "../../mod.ts";
import {
  HTTPOptions,
  HTTPSOptions,
  STATUS_TEXT,
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
   * @property any deno_server
   */
  public deno_server: any;

  public hostname: string = "localhost";

  /**
   * @description
   *     A property to hold this server's logger.
   *
   * @property Drash.Loggers.ConsoleLogger|Drash.Loggers.FileLogger logger
   */
  public logger:
    | Drash.CoreLoggers.ConsoleLogger
    | Drash.CoreLoggers.FileLogger;

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
  protected middleware: any = {
    resource_level: {},
    server_level: {},
  };

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
      options.memory_allocation.multipart_form_data = config
        .multipart_form_data;
    }
    request = await Drash.Services.HttpRequestService.hydrate(
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

      this.executeMiddlewareServerLevelBeforeRequest(request);

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
        "Using `" +
          resource.constructor.name +
          "` resource class to handle the request.",
      );

      this.executeMiddlewareResourceLevelBeforeRequest(request, resource);

      // Perform the request
      this.logDebug("Calling " + request.method.toUpperCase() + "().");
      if (typeof resource[request.method.toUpperCase()] !== "function") {
        throw new Drash.Exceptions.HttpException(405);
      }
      response = await resource[request.method.toUpperCase()]();

      this.executeMiddlewareServerLevelAfterRequest(
        request,
        resource,
        response,
      );
      this.executeMiddlewareResourceLevelAfterRequest(
        request,
        resource,
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
  public handleHttpRequestError(
    request: any,
    error: any,
    resource: Drash.Http.Resource | any = {},
    response: Drash.Http.Response | any = {},
  ): any {
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
    response.body = error.message
      ? error.message
      : response.getStatusMessage();

    this.logDebug(
      `Sending response. Content-Type: ${response.headers.get(
        "Content-Type",
      )}. Status: ${response.getStatusMessageFull()}.`,
    );

    try {
      this.executeMiddlewareServerLevelAfterRequest(request, null, response);
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
    let headers = new Headers();
    headers.set("Content-Type", "image/x-icon");
    let body: any;
    try {
      body = Deno.readFileSync(`${Deno.realpathSync(".")}/favicon.ico`);
    } catch (error) {
    }
    if (!this.trackers.requested_favicon) {
      this.trackers.requested_favicon = true;
      this.logDebug("/favicon.ico requested.");
      if (!body) {
        this.logDebug("/favicon.ico was not found.");
      } else {
        this.logDebug("/favicon.ico was found.");
      }
      this.logDebug("All future log messages for /favicon.ico will be muted.");
    }
    let response = {
      status: 200,
      headers: headers,
      body: body ? body : "",
    };
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
      let response = new Drash.Http.Response(request, {
        views_path: this.configs.views_path,
        template_engine: this.configs.template_engine,
      });
      if (this.configs.pretty_links) {
        let extension = request.url_path.split(".")[1];
        if (!extension) {
          let contents = Deno.readFileSync(
            this.directory + "/" + request.url_path + "/index.html",
          );
          if (contents) {
            response.headers.set("Content-Type", "text/html");
            return response.sendStatic(null, contents);
          }
        }
      }
      return response.sendStatic(this.directory + "/" + request.url_path);
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
    let resourceObj: Drash.Http.Resource = new resourceClass(
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
   * @return Promise<void>
   *     This method just listens for requests at the hostname you provide in the
   *     configs.
   */
  public async run(options: HTTPOptions): Promise<void> {
    if (!options.hostname) {
      options.hostname = this.hostname;
    }
    if (!options.port) {
      options.port = 1447;
    }
    this.hostname = options.hostname;
    if (Deno.env().DRASH_PROCESS != "test") {
      console.log(
        `\nDeno HTTP server started at ${options.hostname}:${options.port}.\n`,
      );
    }
    this.deno_server = serve(options);
    for await (const request of this.deno_server) {
      try {
        this.handleHttpRequest(request);
      } catch (error) {
        this.handleHttpRequestError(request, this.httpErrorResponse(500));
      }
    }
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
   * @return Promise<void>
   *     This method just listens for requests at the hostname you provide in
   *     the configs.
   */
  public async runTLS(options: HTTPSOptions): Promise<void> {
    if (!options.hostname) {
      options.hostname = this.hostname;
    }
    if (!options.port) {
      options.port = 1447;
    }
    this.hostname = options.hostname;
    if (Deno.env().DRASH_PROCESS != "test") {
      console.log(
        `\nDeno HTTPS server started at ${options.hostname}:${options.port}.\n`,
      );
    }
    this.deno_server = serveTLS(options);
    for await (const request of this.deno_server) {
      try {
        this.handleHttpRequest(request);
      } catch (error) {
        this.handleHttpRequestError(request, this.httpErrorResponse(500));
      }
    }
  }

  /**
   * @description
   *     Close the server.
   */
  public close(): void {
    if (Deno.env().DRASH_PROCESS != "test") {
      console.log(`\nDeno server stopped.\n`);
    }
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
    resourceClass.paths.forEach((path: string, index: number) => {
      let pathObj;
      let pathIsWildCard = false;
      try {
        pathIsWildCard = path == "*" || path.includes("*");
      } catch (error) {}
      if (pathIsWildCard) {
        pathObj = {
          og_path: path,
          regex_path: "^." +
            path.replace(
              Server.REGEX_URI_MATCHES,
              Server.REGEX_URI_REPLACEMENT,
            ) +
            "/?$",
          params: (path.match(Server.REGEX_URI_MATCHES) || []).map(
            (path: string) => {
              return path
                .replace(":", "")
                .replace("{", "")
                .replace("}", "");
            },
          ),
        };
        return;
      }
      try {
        pathObj = {
          og_path: path,
          regex_path: "^" +
            path.replace(
              Server.REGEX_URI_MATCHES,
              Server.REGEX_URI_REPLACEMENT,
            ) +
            "/?$",
          params: (path.match(Server.REGEX_URI_MATCHES) || []).map(
            (path: string) => {
              return path
                .replace(":", "")
                .replace("{", "")
                .replace("}", "");
            },
          ),
        };
        resourceClass.paths[index] = pathObj;
      } catch (error) {}
    });

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
  protected addMiddleware(middleware: any): void {
    // Add server-level middleware
    if (middleware.hasOwnProperty("server_level")) {
      if (middleware.server_level.hasOwnProperty("before_request")) {
        this.middleware.server_level.before_request = [];
        middleware
          .server_level
          .before_request
          .forEach((middlewareClass: Drash.Http.Middleware) => {
            this.middleware.server_level.before_request.push(middlewareClass);
          });
      }
      if (middleware.server_level.hasOwnProperty("after_request")) {
        this.middleware.server_level.after_request = [];
        middleware
          .server_level
          .after_request
          .forEach((middlewareClass: Drash.Http.Middleware) => {
            this.middleware.server_level.after_request.push(middlewareClass);
          });
      }
    }

    // Add resource-level middleware
    if (middleware.hasOwnProperty("resource_level")) {
      middleware
        .resource_level
        .forEach((middlewareClass: Drash.Http.Middleware) => {
          this.middleware.resource_level[middlewareClass.name] =
            middlewareClass;
        });
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
   *     Execute resource-level middleware after the request.
   *
   * @param any request
   *     The request object.
   * @param Drash.Http.Resource resource
   *     The resource object.
   *
   * @return void
   */
  protected executeMiddlewareResourceLevelAfterRequest(
    request: any,
    resource: Drash.Http.Resource,
    response: Drash.Http.Response,
  ): void {
    if (
      resource.middleware &&
      resource.middleware.after_request
    ) {
      resource.middleware.after_request.forEach((middlewareClass: string) => {
        if (!this.middleware.resource_level.hasOwnProperty(middlewareClass)) {
          throw new Drash.Exceptions.HttpMiddlewareException(418);
        }
        let mc = this.middleware.resource_level[middlewareClass];
        let middleware = new mc(request, this, resource, response);
        middleware.run();
      });
    }
  }

  /**
   * @description
   *     Execute resource-level middleware before the request.
   *
   * @param any request
   *     The request object.
   * @param Drash.Http.Resource resource
   *     The resource object.
   *
   * @return void
   */
  protected executeMiddlewareResourceLevelBeforeRequest(
    request: any,
    resource: Drash.Http.Resource,
  ): void {
    if (
      resource &&
      resource.middleware &&
      resource.middleware.before_request
    ) {
      resource.middleware.before_request.forEach((middlewareClass: string) => {
        if (!this.middleware.resource_level.hasOwnProperty(middlewareClass)) {
          throw new Drash.Exceptions.HttpMiddlewareException(418);
        }
        let mc = this.middleware.resource_level[middlewareClass];
        let middleware = new mc(request, this, resource);
        middleware.run();
      });
    }
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
  protected executeMiddlewareServerLevelBeforeRequest(
    request: any,
  ): void {
    // Execute server-level middleware
    if (this.middleware.server_level.before_request) {
      this.middleware.server_level.before_request
        .forEach((middlewareClass: any) => {
          let middleware = new middlewareClass(request, this);
          middleware.run();
        });
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
  protected executeMiddlewareServerLevelAfterRequest(
    request: any,
    resource: Drash.Http.Resource | null,
    response: Drash.Http.Response | null,
  ): void {
    if (this.middleware.server_level.hasOwnProperty("after_request")) {
      this.middleware.server_level.after_request
        .forEach((middlewareClass: any) => {
          let middleware = new middlewareClass(
            request,
            this,
            resource,
            response,
          );
          middleware.run();
        });
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
    let matchedResourceClass: any = undefined;

    for (let className in this.resources) {
      // Break out if a resource was matched with the
      // request.parsed_url.pathname variable
      if (matchedResourceClass) {
        break;
      }

      let resource = this.resources[className];

      resource.paths.forEach((pathObj, index) => {
        if (!matchedResourceClass) {
          let thisPathMatchesRequestPathname = null;
          if (pathObj.og_path === "/" && request.url_path === "/") {
            matchedResourceClass = resource;
            return;
          }

          // Check if the current path we're working on matches the request's
          // pathname
          thisPathMatchesRequestPathname = request.url_path.match(
            pathObj.regex_path,
          );
          if (!thisPathMatchesRequestPathname) {
            return;
          }

          // Create the path params
          // TODO(crookse) Put in HttpRequestService
          let requestPathnameParams = request.url_path.match(
            pathObj.regex_path,
          );
          let pathParamsInKvpForm: any = {};
          try {
            requestPathnameParams.shift();
            pathObj.params.forEach((paramName: string, index: number) => {
              pathParamsInKvpForm[paramName] = requestPathnameParams[index];
            });
          } catch (error) {}
          request.path_params = pathParamsInKvpForm;

          // Store the matched resource
          matchedResourceClass = resource;
        }
      });
    }

    return matchedResourceClass;
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
    let staticPath = request.url.split("/")[1];
    // Prefix with a leading slash, so it can be matched properly
    let requestUrl = "/" + staticPath;

    if (this.static_paths.indexOf(requestUrl) != -1) {
      request = Drash.Services.HttpRequestService.hydrate(request, {
        headers: {
          "Response-Content-Type": Drash.Services.HttpService.getMimeType(
            request.url,
            true,
          ),
        },
      });
      return true;
    }

    return false;
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
