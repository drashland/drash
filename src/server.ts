import { serve } from "https://deno.land/x/http/server.ts";
import regex from './regex.ts';
import Response from './http/response.ts';

export default function Server(configs = {
  response_output: 'application/json'
}) {
  const denoServer = serve("127.0.0.1:8000");

  this.Resource = {};
  this.configs = configs;
  this.trackers = {
    requested_favicon: false,
  };
  this.response = {
    body: {}
  };

  this.addHttpResource = addHttpResource;
  this.getRequestedResponseOutput = getRequestedResponseOutput;
  this.getResourceClass = getResourceClass;
  this.run = run;

  // METHODS - PUBLIC //////////////////////////////////////////////////////////////////////////////

  function addHttpResource(resourceInfo) {
    // Everything good? If so, parse the paths so the server can better match a request URI with a
    // resource during request-response cycles.
    resourceInfo.paths.forEach((path, index) => {
      let pathObj = {
        og_path: path,
        regex_path: '^' + path.replace(regex.uri_matches, regex.uri_replacement) + '$',
        params: (path.match(regex.uri_matches) || []).map((path) => {
          return path.replace(':', '').replace('{', '').replace('}', '');
        }),
      };
      resourceInfo.paths[index] = pathObj;
    });

    this.Resource[resourceInfo.class.name] = resourceInfo;

    console.log(`Resource with class "${resourceInfo.class.name}" added.`);
  }

  function getRequestedResponseOutput(request) {
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

  function getResourceClass(request) {
    let matchedResourceClass = undefined;

    for (let className in this.Resource) {// eslint-disable-line
      // Break out if a resource was matched with the request.parsed_url.pathname variable
      if (matchedResourceClass) {
        break;
      }

      let resource = this.Resource[className];

      resource.paths.forEach(function getResourceClass_forEachPaths(pathObj, index) {
        if (!matchedResourceClass) {
          let thisPathMatchesRequestPathname = null;
          if (pathObj.og_path === '/' && request.url.pathname === '/') {
            matchedResourceClass = resource.class;
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
          matchedResourceClass = resource.class;
        }
      });
      return matchedResourceClass;
    }

    return matchedResourceClass;
  }

  async function run() {
  // TODO(crookse) Need try-catch logic.
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

      let resource = this.getResourceClass(request);
      resource = new resource();
      resource.request = request;
      resource.response = new Response();

      let contentType = this.getRequestedResponseOutput(request);
      let headers = new Headers();
      let resourceMethod = 'HTTP_GET_JSON';

      switch (contentType) {
        case 'application/json':
          headers.set('Content-Type', 'application/json');
          resourceMethod = 'HTTP_GET_JSON';
          break;
          case 'text/html':
          headers.set('Content-Type', 'text/html');
          resourceMethod = 'HTTP_GET_HTML';
          break;
        default:
          headers.set('Content-Type', 'json');
          resourceMethod = 'HTTP_GET_JSON';
          break;
      }

      let response = resource[resourceMethod]();

      switch (contentType) {
        case 'application/json':
          headers.set('Content-Type', 'application/json');
          resourceMethod = 'HTTP_GET_JSON';
          request.respond({
            headers: headers,
            body: new TextEncoder().encode(JSON.stringify(response.body)),
          });
          break;
        case 'text/html':
            let body = `<!DOCTYPE html>
<head>
  <title>HTML</title>
  <style>
    html { font-family: Arial }
  </style>
</head>
<body>
<h1>Hello World</h1>
<p>${response.body}</p>
</body>
</html>`;
            request.respond({
              headers: headers,
              body: new TextEncoder().encode(body),
            });
          break;
        default:
          headers.set('Content-Type', 'json');
          resourceMethod = 'HTTP_GET_JSON';
          break;
      }
    }
  }

  // METHODS - PRIVATE /////////////////////////////////////////////////////////////////////////////
}
