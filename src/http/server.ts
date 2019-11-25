import Drash from "../../mod.ts";
import {
  STATUS_TEXT,
  Status,
  serve,
} from "../../deno_std.ts";

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
export default class Server {
  static REGEX_URI_MATCHES = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, "g");
  static REGEX_URI_REPLACEMENT = "([^/]+)";
  protected trackers = {
    requested_favicon: false
  };

  /**
   * @description
   *     A property to hold this server's logger.
   *
   * @property Drash.Loggers.ConsoleLogger|Drash.Loggers.FileLogger logger
   */
  public logger: Drash.Loggers.ConsoleLogger | Drash.Loggers.FileLogger;

  /**
   * @description
   *     A property to hold this server's configs.
   *
   * @property any configs
   */
  protected configs: any;

  /**
   * @description
   *     A property to hold the Deno server. This property is set in
   *     `this.run()` like so: ` this.deno_server =
   *     serve(this.configs.address);`. `serve()` is imported from
   *     [https://deno.land/x/http/server.ts](https://deno.land/x/http/server.ts).
   *
   * @property any deno_server
   */
  protected deno_server: any;

  /**
   * @description
   *     A property to hold middleware to be run before requests.
   *
   * @property any middleware_server_before_request
   */
  protected middleware_server_before_request: any[] = [];

  /**
   * @description
   *     A property to hold middleware to be run before responses.
   *
   * @property any middleware_server_before_response
   */
  protected middleware_server_before_response: any[] = [];

  /**
   * @description
   *     A property to hold middleware to be run after responses.
   *
   * @property any middleware_server_after_response
   */
  protected middleware_server_after_response: any[] = [];

  /**
   * @description
   *     A property to hold middleware (for resource use) passed in from the
   *     configs.
   *
   * @property any middleware_resource
   */
  protected middleware_resource: any = {};

  /**
   * @description
   *     A property to hold the resources passed in from the configs.
   *
   * @property any[] resources
   */
  protected resources: any[] = [];

  /**
   * @description
   *     This server's list of static paths. HTTP requests to a static path are
   *     usually intended to retrieve some type of concrete resource (e.g., a
   *     CSS file or a JS file). If an HTTP request is matched to a static path
   *     and the resource the HTTP request is trying to get is found, then
   *     `Drash.Http.Response` will use its `sendStatic()` method to send the
   *     static asset back to the client.
   *
   * @property string[] static_paths
   */
  protected static_paths: string[] = [];

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * @description
   *     Construct an object of this class.
   *
   * @param any configs
   *     `address`: `string`
   *
   *     `logger`: `Drash.Loggers.ConsoleLogger|Drash.Loggers.FileLogger`
   *
   *     `response_output`: `string` (a proper MIME type)
   *
   *     `resources`: `Drash.Http.Resource[]`
   *
   *     `static_paths`: `string[]`
   */
  constructor(configs: any) {
    if (!configs.logger) {
      this.logger = new Drash.Loggers.ConsoleLogger({
        enabled: false
      });
    } else {
      this.logger = configs.logger;
    }

    if (!configs.address) {
      configs.address = "127.0.0.1:8000";
    }

    if (!configs.response_output) {
      configs.response_output = "application/json";
    }

    this.configs = configs;

    if (configs.middleware) {
      if (configs.middleware.hasOwnProperty("server")) {
        configs.middleware.server.forEach(middlewareClass => {
          this.addHttpMiddlewareServer(middlewareClass);
        });
      }
      if (configs.middleware.hasOwnProperty("resource")) {
        configs.middleware.resource.forEach(middlewareClass => {
          this.addHttpMiddlewareResource(middlewareClass);
        });
      }
    }

    if (configs.resources) {
      configs.resources.forEach(resourceClass => {
        this.addHttpResource(resourceClass);
      });
      delete this.configs.resources;
    }

    if (configs.static_paths) {
      configs.static_paths.forEach(path => {
        this.addStaticPath(path);
      });
    }
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////

  /**
   * @description
   *     Handle an HTTP request from the Deno server.
   *
   * @param ServerRequest request
   *     The request object.
   *
   * @return any
   *    See `Drash.Http.Response.send()`.
   */
  public handleHttpRequest(request): any {
    // Handle a request to a static path
    if (this.requestTargetsStaticPath(request)) {
      return this.handleHttpRequestForStaticPathAsset(request);
    }

    // Handle a request to the favicon
    if (request.url == "/favicon.ico") {
      return this.handleHttpRequestForFavicon(request);
    }

    this.logger.info(
      `Request received: ${request.method.toUpperCase()} ${request.url}`
    );

    request = this.getRequest(request);

    let resourceClass = this.getResourceClass(request);

    // No resource? Send a 404 (Not Found) response.
    if (!resourceClass) {
      return this.handleHttpRequestError(request, this.httpErrorResponse(404));
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
    let resource = this.getResourceObject(resourceClass, request);
    request.resource = resource;
    this.logger.debug(
      "Using `" +
        resource.constructor.name +
        "` resource class to handle the request."
    );

    let response;
    let output;

    try {
      // Perform "before_request" server middleware
      this.middleware_server_before_request.forEach(middlewareClass => {
        let middleware = new middlewareClass();
        middleware.run(request);
      });

      // Perform resource middleware defined in the resource
      if (resource.middleware) {
        resource.middleware.forEach(middlewareClass => {
          if (!this.middleware_resource.hasOwnProperty(middlewareClass)) {
            this.logger.debug(`Middleware class "${middlewareClass}" does not exist.`);
            throw new Drash.Exceptions.HttpMiddlewareException(418);
          }
          let middleware = new this.middleware_resource[middlewareClass]();
          middleware.run(request);
        });
      }

      // Perform the request
      this.logger.debug("Calling " + request.method.toUpperCase() + "().");
      response = resource[request.method.toUpperCase()]();

      // Perform "before_response" server middleware
      this.middleware_server_before_response.forEach(middlewareClass => {
        let middleware = new middlewareClass();
        middleware.run(request);
      });

      // Send the response
      this.logger.info("Sending response. " + response.status_code + ".");
      output = response.send();

    } catch (error) {
      // console.log(error);
      return this.handleHttpRequestError(request, error, resource, response);
    }

    // Perform "after_response" server middleware
    this.middleware_server_after_response.forEach(middlewareClass => {
      try {
        let middleware = new middlewareClass();
        middleware.run(request);
      } catch (error) {
        // Do nothing... the response was already sent. We don't want to throw
        // errors after the response has been sent. TODO(crookse) log maybe?
      }
    });

    return output;
  }

  /**
   * @description
   *     Handle cases when an error is thrown when handling an HTTP request.
   *
   * @param ServerRequest request
   *     The request object.
   * @param any error
   *     The error object.
   *
   * @return any
   *     See `Drash.Http.Response.send()`.
   */
  public handleHttpRequestError(
    request: any,
    error: any,
    resource: Drash.Http.Resource = null,
    response: Drash.Http.Response = null
  ): any {
    this.logger.debug(
      `Error occurred while handling request: ${request.method} ${request.url}`
    );
    this.logger.trace(error.message);
    this.logger.trace("Stack trace below:");
    this.logger.trace(error.stack);

    this.logger.trace("Generating generic error response object.");

    // If a resource was found, but an error occurred, then that's most likely
    // due to the HTTP method not being defined in the resource class;
    // therefore, the method is not allowed. In this case, we send a 405
    // (Method Not Allowed) response.
    if (resource) {
      if (!response) {
        if (typeof resource[request.method.toUpperCase()] !== 'function') {
          error = new Drash.Exceptions.HttpException(405);
        }
      }
    }

    response = new Drash.Http.Response(request);
    response.status_code = error.code
      ? error.code
      : null;
    response.body = error.message
      ? error.message
      : response.getStatusMessage();

    this.logger.info(
      `Sending response. Content-Type: ${response.headers.get(
        "Content-Type"
      )}. Status: ${response.getStatusMessageFull()}.`
    );

    return response.send();
  }

  /**
   * @description
   *     Handle HTTP requests for the favicon. This method only exists to
   *     short-circuit favicon requests--preventing the requests from clogging
   *     the logs.
   *
   * @param ServerRequest request
   *
   * @return any
   *     Returns the response as stringified JSON. This is only used for unit
   *     testing purposes.
   */
  public handleHttpRequestForFavicon(request): any {
    let headers = new Headers();
    headers.set("Content-Type", "image/x-icon");
    if (!this.trackers.requested_favicon) {
      this.trackers.requested_favicon = true;
      this.logger.debug("/favicon.ico requested.");
      this.logger.debug(
        "All future log messages for /favicon.ico will be muted."
      );
    }
    let response = {
      status: 200,
      headers: headers
    };
    request.respond(response);
    return JSON.stringify(response);
  }
  /**
   * @description
   *     Handle HTTP requests for static path assets.
   *
   * @param ServerRequest request
   *
   * @return any
   *     Returns the response as stringified JSON. This is only used for unit
   *     testing purposes.
   */
  public handleHttpRequestForStaticPathAsset(request): any {
    try {
      let response = new Drash.Http.Response(request);
      return response.sendStatic();
    } catch (error) {
      return this.handleHttpRequestError(request, this.httpErrorResponse(404));
    }
  }

  public getResourceObject(resourceClass: any, request: any): any {
    let resourceObj = new resourceClass(request, new Drash.Http.Response(request), this);
    // We have to add the static properties back because they get blown away
    // when the resource object is created
    resourceObj.paths = resourceClass.paths;
    resourceObj.middleware = resourceClass.middleware;
    return resourceObj;
  }

  /**
   * @description
   *     Run the Deno server at the address specified in the configs. This
   *     method takes each HTTP request and creates a new and more workable
   *     request object and passes it to
   *     `Drash.Http.Server.handleHttpRequest()`.
   *
   * @return Promise<void>
   *     This method just listens for requests at the address you provide in the
   *     configs.
   */
  public async run(): Promise<void> {
    console.log(`\nDeno server started at ${this.configs.address}.\n`);
    this.deno_server = serve(this.configs.address);
    for await (const request of this.deno_server) {
      try {
        this.handleHttpRequest(request);
      } catch (error) {
        this.handleHttpRequestError(request, this.httpErrorResponse(500));
      }
    }
  }

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////

  /**
   * @description
   *     Add middleware to the server.
   *
   * @param Drash.Http.Middleware middlewareClass
   *
   * @return void
   */
  protected addHttpMiddlewareServer(
    middlewareClass: Drash.Http.Middleware
  ): void {
    if (middlewareClass.location) {
      this[`middleware_server_${middlewareClass.location}`].push(middlewareClass);
      return;
    }
    this.middleware_server_before_request.push(middlewareClass);
  }

  /**
   * @description
   *     Add middleware to the server.
   *
   * @param Drash.Http.Middleware middlewareClass
   *
   * @return void
   */
  protected addHttpMiddlewareResource(
    middlewareClass: Drash.Http.Middleware
  ): void {
    this.middleware_resource[middlewareClass.name] = middlewareClass;
  }

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
    resourceClass.paths.forEach((path, index) => {
      let pathObj;
      let pathIsWildCard = false;
      try {
        pathIsWildCard = (path == "*" || path.includes("*"));
      } catch (error) {
      }
      if (pathIsWildCard) {
        pathObj = {
          og_path: path,
          regex_path:
            "^." +
            path.replace(
              Server.REGEX_URI_MATCHES,
              Server.REGEX_URI_REPLACEMENT
            ) +
            "$",
          params: (path.match(Server.REGEX_URI_MATCHES) || []).map(path => {
            return path
              .replace(":", "")
              .replace("{", "")
              .replace("}", "");
          })
        };
        return;
      }
      try {
        pathObj = {
          og_path: path,
          regex_path:
            "^" +
            path.replace(
              Server.REGEX_URI_MATCHES,
              Server.REGEX_URI_REPLACEMENT
            ) +
            "$",
          params: (path.match(Server.REGEX_URI_MATCHES) || []).map(path => {
            return path
              .replace(":", "")
              .replace("{", "")
              .replace("}", "");
          })
        };
        resourceClass.paths[index] = pathObj;
      } catch (error) {
      }
    });

    // Store the resource so it can be retrieved when requested
    this.resources[resourceClass.name] = resourceClass;
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
   *     Get the request object with more properties and methods.
   *
   * @param ServerRequest request
   *     The request object.
   *
   * @return any
   *     Returns the `ServerRequest` object with more properties and methods.
   */
  protected getRequest(request: any): any {
    request = Drash.Services.HttpService.hydrateHttpRequest(request, {
      base_url: this.configs.address,
      headers: {
        "Response-Content-Type-Default": this.configs.response_output
      },
    });

    return request;
  }

  /**
   * @description
   *     Get the resource class.
   *
   * @param ServerRequest request
   *     The request object.
   *
   * @return Drash.Http.Resource|undefined
   *     Returns a `Drash.Http.Resource` object if the URL path of the request
   *     can be matched to a `Drash.Http.Resource` object's paths.
   *
   *     Returns `undefined` if a `Drash.Http.Resource` object can't be matched.
   */
  protected getResourceClass(request): Drash.Http.Resource | undefined {
    let matchedResourceClass = undefined;

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
            pathObj.regex_path
          );
          if (!thisPathMatchesRequestPathname) {
            return;
          }

          // Create the path params
          // TODO(crookse) put in HttpService
          let requestPathnameParams = request.url_path.match(
            pathObj.regex_path
          );
          let pathParamsInKvpForm = {};
          try {
            requestPathnameParams.shift();
            pathObj.params.forEach((paramName, index) => {
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
   * @param ServerRequest request
   *
   * @return boolean
   *     Returns true if the request targets a static path.
   */
  protected requestTargetsStaticPath(request): boolean {
    if (this.static_paths.length <= 0) {
      return false;
    }
    // If the request URL is "/public/assets/js/bundle.js", then we take out
    // "/public" and use that to check against the static paths
    let requestUrl = `/${request.url.split("/")[1]}`;

    if (this.static_paths.indexOf(requestUrl) != -1) {
      request = Drash.Services.HttpService.hydrateHttpRequest(request, {
        headers: {
          "Response-Content-Type": Drash.Services.HttpService.getMimeType(
            request.url,
            true
          )
        }
      });
      return true;
    }

    return false;
  }
}
