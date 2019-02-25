import { serve } from "https://deno.land/x/http/server.ts";
import Drash from "../../mod.ts";

const denoServer = serve("127.0.0.1:8000");

export default class Server {
  static CONFIGS = {
    default_response_content_type: 'application/json',
  };
  static REGEX_URI_MATCHES = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, 'g');
  static REGEX_URI_REPLACEMENT = '([^/]+)';

  protected configs;
  protected resources = {};
  protected trackers = {
    requested_favicon: false,
  };

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param configs 
   */
  constructor(configs: any) {
    this.configs = configs;

    if (this.configs.response_output) {
      Server.CONFIGS.default_response_content_type = this.configs.response_output
    }

    if (this.configs.resources) {
      this.configs.resources.forEach((resource) => {
        this.addHttpResource(resource);
      });
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
      let pathObj = {
        og_path: path,
        regex_path: '^' + path.replace(Server.REGEX_URI_MATCHES, Server.REGEX_URI_REPLACEMENT) + '$',
        params: (path.match(Server.REGEX_URI_MATCHES) || []).map((path) => {
          return path.replace(':', '').replace('{', '').replace('}', '');
        }),
      };
      resourceClass.paths[index] = pathObj;
    });

    // Store the resource so it can be retrieved when requested
    this.resources[resourceClass.name] = resourceClass;

    console.log(`HTTP resource "${resourceClass.name}" added.`);
  }
  
  /**
   * Handle an HTTP request from the Deno server.
   *
   * @param ServerRequest request
   * @param denoServer 
   */
  public handleHttpRequest(request, denoServer): void {
    if (request.url == '/favicon.ico') {
      return this.handleHttpRequestForFavicon(request);
    }

    console.log(`Request received: ${request.method.toUpperCase()} ${request.url}`);

    let resource = this.getResource(request);

    // No resource? Send a 404 (Not Found) response.
    if (!resource) {
      return this.handleHttpRequestError(request, new Drash.Exceptions.HttpException404());
    }

    try {
      console.log(`Calling ${resource.constructor.name}.${request.method.toUpperCase()}() method.`);
      let response = resource[request.method.toUpperCase()]();
      response.send();
    } catch (error) {
      // If a resource was found, but an error occurred, then that's most likely due to the HTTP
      // method not being defined in the resource class; therefore, the method is not allowed. In
      // this case, we send a 405 (Method Not Allowed) response.
      if (resource && !error.code) {
        return this.handleHttpRequestError(request, new Drash.Exceptions.HttpException405());
      }

      // All other errors go here
      this.handleHttpRequestError(request, error);
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
  public handleHttpRequestError(request, error): void {
    console.log(`Error occurred while handling request: ${request.method} ${request.url}`);
    console.log('Stack trace below:');
    console.log(error.stack);

    let response = new Drash.Http.Response(request);

    switch (error.code) {
      case 404:
        response.status_code = 404;
        response.body = `The requested URL '${request.url}' was not found on this server.`;
        break;
      case 405:
        response.status_code = 405;
        response.body = `URI '${request.url}' does not allow ${request.method.toUpperCase()} requests.`;// eslint-disable-line
        break;
      default:
        response.status_code = 400;
        response.body = 'Something went wrong.';
        break;
    }

    response.send();
  }

  /**
   * Handle HTTP requests for the favicon. This method only exists to short-circuit favicon requests--preventing the requests from clogging the logs.
   *
   * @param ServerRequest request
   */
  public handleHttpRequestForFavicon(request): void {
    let headers = new Headers();
    headers.set('Content-Type', 'image/x-icon');
    if (!this.trackers.requested_favicon) {
      this.trackers.requested_favicon = true;
      console.log('/favicon.ico requested.');
      console.log('All future log messages for this request will be muted.');
    }

    request.respond({
      status: 200,
      headers: headers
    });
  }
  
  /**
   * Run the Deno server.
   */
  public async run(): Promise<void> {
    for await (const request of denoServer) {
      this.handleHttpRequest(request, denoServer);
    }
  }

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////////////////////////

  /**
   * Get the resource based on the request.
   *
   * @param ServerRequest request
   *     The request object from the Deno server.
   * 
   * @return Drash.Http.Resource|undefined
   */
  protected getResource(request) {
    let resource = this.getResourceClass(request);

    return resource
      ? new resource(request)
      : resource;
  }

  /**
   * Get the resource class.
   *
   * @param ServerRequest request
   * 
   * @return Drash.Http.Resource|undefined
   */
  protected getResourceClass(request) {
    let matchedResourceClass = undefined;

    for (let className in this.resources) {// eslint-disable-line
      // Break out if a resource was matched with the request.parsed_url.pathname variable
      if (matchedResourceClass) {
        break;
      }

      let resource = this.resources[className];

      resource.paths.forEach(function getResourceClass_forEachPaths(pathObj, index) {
        if (!matchedResourceClass) {
          let thisPathMatchesRequestPathname = null;
          if (pathObj.og_path === '/' && request.url.pathname === '/') {
            matchedResourceClass = resource;
            return;
          }

          // Check if the current path we're working on matches the request's pathname
          thisPathMatchesRequestPathname = request.url.match(pathObj.regex_path);
          if (!thisPathMatchesRequestPathname) {
            return;
          }

          // Create the path params
          let requestPathnameParams = request.url.match(pathObj.regex_path);
          let pathParamsInKvpForm = {};
          try {
            requestPathnameParams.shift();
            pathObj.params.forEach(function closure_getResourceClass_forEach_params_forEach(paramName, index) {
              pathParamsInKvpForm[paramName] = requestPathnameParams[index];
            });
          } catch (error) {
          }
          request.path_params = pathParamsInKvpForm;

          // Store the matched resource
          matchedResourceClass = resource;
        }
      });
      return matchedResourceClass;
    }

    return matchedResourceClass;
  }
}
