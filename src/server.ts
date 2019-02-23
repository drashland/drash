import { serve } from "https://deno.land/x/http/server.ts";
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

  constructor(configs = Server.DEFAULT_CONFIGS) {
    this.configs = configs;

    if (!this.configs.response_output) {
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
        continue;
      }

      console.log(`Request received: ${request.method.toUpperCase()} ${request.url}`);

      let resource = this.getResource(request);
      let response = resource.handleRequest();;

      response.send();
    }
  }

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////////////////////////

  protected getRequestedResponseOutput(request) {
    let output = this.configs.response_output;

    // Check the request headers to see if `response-output: {output}` has been specified
    if (
      request.headers['response-output']
      && (typeof request.headers['response-output'] === 'string')
    ) {
      output = request.headers['response-output'];
    }

    // Check the request's URL query params to see if ?output={output} has been specified
    // TODO(crookse) Add this logic
    // output = request.url_query_params.output
    //   ? request.url_query_params.output
    //   : output;

    // Make sure this is lowercase to prevent any "gotchas" later
    return output.toLowerCase();
  }

  protected getResource(request) {
    let resource = this.getResourceClass(request);
    resource = new resource(request);

    let mimeType = this.getRequestedResponseOutput(request)

    switch (mimeType) {
      case 'application/json':
        resource.response.headers.set('Content-Type', 'application/json');
        resource.setHttpMethod('HTTP_GET_JSON');
        break;
        case 'text/html':
        resource.response.headers.set('Content-Type', 'text/html');
        resource.setHttpMethod('HTTP_GET_HTML');
        break;
      default:
        resource.response.headers.set('Content-Type', 'json');
        resource.setHttpMethod('HTTP_GET_JSON');
        break;
    }

    return resource;
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
