import { serve } from "https://deno.land/x/http/server.ts";
import Drash from "../../mod.ts";

export default class Server {
  static REGEX_URI_MATCHES = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, "g");
  static REGEX_URI_REPLACEMENT = "([^/]+)";

  protected configs_defaults = {
    address: "127.0.0.1:8000",
    default_response_content_type: "application/json",
    log: {
      enabled: false
    }
  };
  protected configs;
  protected deno_server;
  protected resources = {};
  protected trackers = {
    requested_favicon: false
  };

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param configs
   */
  constructor(configs?: any) {
    if (!configs.response_output) {
      configs.response_output = this.configs_defaults.default_response_content_type;
    }

    if (!configs.log) {
      configs.log = this.configs_defaults.log;
    }

    this.configs = configs;

    if (configs.resources) {
      configs.resources.forEach(resource => {
        this.addHttpResource(resource);
      });
      delete this.configs.resources;
    }
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////////////////////////

  /**
   * Add an HTTP resource to the server which can be retrieved at specific URIs. Drash defines an
   * HTTP resource according to the following:
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web
   *
   * @param Drash.Http.Resource resourceClass
   */
  public addHttpResource(resourceClass): void {
    resourceClass.paths.forEach((path, index) => {
      try {
        let pathObj = {
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
        this.log(error);
      }
    });

    // Store the resource so it can be retrieved when requested
    this.resources[resourceClass.name] = resourceClass;

    this.log(`HTTP resource "${resourceClass.name}" added.`);
  }

  /**
   * Handle an HTTP request from the Deno server.
   *
   * @param Server.ServerRequest request
   */
  public handleHttpRequest(request): any {
    if (request.url == "/favicon.ico") {
      return this.handleHttpRequestForFavicon(request);
    }

    this.log(
      `Request received: ${request.method.toUpperCase()} ${request.url}`
    );

    request = Drash.Services.HttpService.hydrateHttpRequest(request, {
      headers: {
        "Response-Content-Type-Default": this.configs.response_output
      }
    });

    let resource = this.getResourceClass(request);

    // No resource? Send a 404 (Not Found) response.
    if (!resource) {
      return this.handleHttpRequestError(
        request,
        new Drash.Exceptions.HttpException(404)
      );
    }

    resource = new resource(request, new Drash.Http.Response(request), this);

    try {
      this.log(
        `Calling ${
          resource.constructor.name
        }.${request.method.toUpperCase()}() method.`
      );
      let response = resource[request.method.toUpperCase()]();
      this.log(
        `Sending response. Content-Type: ${response.headers.get(
          "Content-Type"
        )}. Status: ${response.getStatusMessage()}.`
      );
      return response.send();
    } catch (error) {
      // If a resource was found, but an error occurred, then that's most likely due to the HTTP
      // method not being defined in the resource class; therefore, the method is not allowed. In
      // this case, we send a 405 (Method Not Allowed) response.
      if (resource && !error.code) {
        return this.handleHttpRequestError(
          request,
          new Drash.Exceptions.HttpException(405)
        );

        // All other errors go here
        return this.handleHttpRequestError(request, error);
      }
    }
  }

  /**
   * Handle cases when an error is thrown when handling an HTTP request.
   *
   * TODO(crookse) Request URL parser
   *
   * @param request
   * @param error
   */
  public handleHttpRequestError(request, error): any {
    this.log(
      `Error occurred while handling request: ${request.method} ${request.url}`
    );
    this.log("Stack trace below:");
    this.log(error.stack);

    let requestUrl = request.url.split("?")[0];

    let response = new Drash.Http.Response(request);

    switch (error.code) {
      case 404:
        response.body = `The requested URL '${requestUrl}' was not found on this server.`;
        break;
      case 405:
        response.body = `URI '${requestUrl}' does not allow ${request.method.toUpperCase()} requests.`; // eslint-disable-line
        break;
      default:
        error.code = 400;
        response.body = "Something went wrong.";
        break;
    }

    response.status_code = error.code;

    this.log(
      `Sending response. Content-Type: ${response.headers.get(
        "Content-Type"
      )}. Status: ${response.getStatusMessage()}.`
    );

    return response.send();
  }

  /**
   * Handle HTTP requests for the favicon. This method only exists to short-circuit favicon requests--preventing the requests from clogging the logs.
   *
   * @param ServerRequest request
   */
  public handleHttpRequestForFavicon(request): any {
    let headers = new Headers();
    headers.set("Content-Type", "image/x-icon");
    if (!this.trackers.requested_favicon) {
      this.trackers.requested_favicon = true;
      this.log("/favicon.ico requested.");
      this.log("All future log messages for this request will be muted.");
    }
    let response = {
      status: 200,
      headers: headers
    };
    request.respond(response);
    return JSON.stringify(response);
  }

  /**
   * Log a message.
   */
  public log(message) {
    if (this.configs && this.configs.log.enabled) {
      console.log(message);
    }
  }

  /**
   * Run the Deno server.
   */
  public async run(): Promise<void> {
    this.log(`Deno server started at ${this.configs.address}.`);
    this.deno_server = serve(this.configs.address);
    for await (const request of this.deno_server) {
      this.handleHttpRequest(request);
    }
  }

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////////////////////////

  /**
   * Get the resource class.
   *
   * @param ServerRequest request
   *
   * @return Drash.Http.Resource|undefined
   */
  protected getResourceClass(request) {
    let matchedResourceClass = undefined;
    let requestUrl = request.url.split("?")[0];

    for (let className in this.resources) {
      // eslint-disable-line
      // Break out if a resource was matched with the request.parsed_url.pathname variable
      if (matchedResourceClass) {
        break;
      }

      let resource = this.resources[className];

      resource.paths.forEach(function getResourceClass_forEachPaths(
        pathObj,
        index
      ) {
        if (!matchedResourceClass) {
          let thisPathMatchesRequestPathname = null;
          if (pathObj.og_path === "/" && requestUrl.pathname === "/") {
            matchedResourceClass = resource;
            return;
          }

          // Check if the current path we're working on matches the request's pathname
          thisPathMatchesRequestPathname = requestUrl.match(pathObj.regex_path);
          if (!thisPathMatchesRequestPathname) {
            return;
          }

          // Create the path params
          let requestPathnameParams = requestUrl.match(pathObj.regex_path);
          let pathParamsInKvpForm = {};
          try {
            requestPathnameParams.shift();
            pathObj.params.forEach(
              function closure_getResourceClass_forEach_params_forEach(
                paramName,
                index
              ) {
                pathParamsInKvpForm[paramName] = requestPathnameParams[index];
              }
            );
          } catch (error) {}
          request.path_params = pathParamsInKvpForm;

          // Store the matched resource
          matchedResourceClass = resource;
        }
      });
    }

    return matchedResourceClass;
  }
}
