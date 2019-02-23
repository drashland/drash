import { serve } from "https://deno.land/x/http/server.ts";
import Response from "./http/response.ts"
import HttpException404 from "./exceptions/exception404.ts";
import HttpException405 from "./exceptions/exception405.ts";
const denoServer = serve("127.0.0.1:8000");

export default class Server {
  static DEFAULT_CONFIGS = {
    response_output: 'application/json'
  };
  static REGEX_URI_MATCHES = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, 'g');
  static REGEX_URI_REPLACEMENT = '([^/]+)';

  protected configs;
  protected resources = {};
  protected trackers = {
    requested_favicon: false,
  };

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  constructor(configs: any) {
    this.configs = configs;

    if (
      (typeof this.configs.response_output != 'string')
      || !this.configs.response_output
      || this.configs.response_output.trim() == ''
    ) {
      this.configs.response_output = 'application/json';
    }

    if (this.configs.resources) {
      this.configs.resources.forEach((resource) => {
        this.addHttpResource(resource);
      });
    }
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////////////////////////

  public addHttpResource(resourceClass) {
    // Everything good? If so, parse the paths so the server can better match a request URI with a
    // resource during request-response cycles.
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

    this.resources[resourceClass.name] = resourceClass;

    console.log(`Resource with class "${resourceClass.name}" added.`);
  }

  public async run() {
    for await (const request of denoServer) {
      if (request.url == '/favicon.ico') {
        this.sendResponseForRequestFavicon(request);
        continue;
      }

      console.log(`Request received: ${request.method.toUpperCase()} ${request.url}`);

      // TODO(crookse) Find a different way to set the defalut output for the response object
      request.headers.set('response-output-default', this.configs.response_output);

      let resource = this.getResource(request);

      // No resource? Send 404 response.
      if (!resource) {
        this.sendErrorResponse(request, new HttpException404());
        continue;
      }

      try {
        let response = resource.handleRequest();
        response.send();
      } catch (error) {
        // If we found a resource, but an error occurred, then that's most likely due to the HTTP
        // method not being defined in the resource class; therfore, the method is not allowed.
        if (resource && !error.code) {
          this.sendErrorResponse(request, new HttpException405(), resource);
        } else {
          this.sendErrorResponse(request, error);
        }
      }
    }
  }

  public sendErrorResponse(request, error, resource?) {
    console.log(`Error occurred while handling request: ${request.method} ${request.url}`);
    console.log('Stack trace below:');
    console.log(error.stack);

    let response = new Response(request);

    switch (error.code) {
      case 404:
        response.status_code = 404;
        response.body = `The requested URL '${request.url}' was not found on this server.`;
        break;
      case 405:
        response.status_code = 405;
        // TODO(crookse) Make error message say ".. doesn't allow {METHOD} requests for
        // {CONTENT_TYPE} responses..."
        response.body = `URI '${request.url}' doesn't allow the '${resource.getHttpMethod()}' method.`;// eslint-disable-line
        break;
      default:
        response.status_code = 400;
        response.body = 'Something went wrong.';
        break;
    }

    response.send();
  }

  public sendResponseForRequestFavicon(request) {
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

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////////////////////////

  protected getResource(request) {
    let resource = this.getResourceClass(request);

    if (!resource) {
      return resource;
    }

    return new resource(request);
  }

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
