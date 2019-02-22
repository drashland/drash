import { serve } from "https://deno.land/x/http/server.ts";
const server = serve("127.0.0.1:8000");

const REGEX_URI_MATCHES = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, 'g');
const REGEX_URI_REPLACEMENT = '([^/]+)';

let Resource = {};

let favicon_requested = false;

async function handleHttpRequest() {
  for await (const request of server) {
    if (request.url == '/favicon.ico') {
      let headers = new Headers();
      headers.set('Content-Type', 'image/x-icon');
      if (!favicon_requested) {
        favicon_requested = true;
        console.log('/favicon.ico requested.');
        console.log('All future log messages for this request will be muted.');
      }
      request.respond({
        status: 200,
        body: null,
        headers: headers
      });
      continue;
    }

    console.log(`Request received: ${request.method.toUpperCase()} ${request.url}`);

    let resource = getResourceClass(request);
    resource = new resource();
    resource.request = request;
    resource['HTTP_GET_HTML']();
  }
}

function addHttpResource(resourceInfo) {
  // Everything good? If so, parse the paths so the server can better match a request URI with a
  // resource during request-response cycles.
  resourceInfo.paths.forEach((path, index) => {
    let pathObj = {
      og_path: path,
      regex_path: '^' + path.replace(REGEX_URI_MATCHES, REGEX_URI_REPLACEMENT) + '$',
      params: (path.match(REGEX_URI_MATCHES) || []).map((path) => {
        return path.replace(':', '').replace('{', '').replace('}', '');
      }),
    };
    resourceInfo.paths[index] = pathObj;
  });

  Resource[resourceInfo.class.name] = resourceInfo;

  console.log(`Resource with class "${resourceInfo.class.name}" added.`);
}

function getResourceClass(request) {
  let matchedResourceClass = undefined;
  for (let key in Resource) {// eslint-disable-line
    // Break out if a resource was matched with the request.parsed_url.pathname variable
    if (matchedResourceClass) {
      break;
    }
    let resource = Resource[key];
    resource.paths.forEach(function closure_getResourceClass_forEach(pathObj, index) {
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

handleHttpRequest();

addHttpResource({
  paths: ['/hello'],
  class: function HelloResource() {
    this.HTTP_GET_JSON = () => {
      let headers = new Headers();
      headers.set('Content-Type', 'application/json');
      this.request.respond({
        headers: headers,
        body: new TextEncoder().encode("Hello World\n"),
      });
    };

    this.HTTP_GET_HTML = () => {
      let headers = new Headers();
      headers.set('Content-Type', 'text/html');
      let body = `<!DOCTYPE html>
<head>
  <title>HTML</title>
  <style>
    html { font-family: Arial }
  </style>
</head>
<body>
<h1>Hello World</h1>
<p>You made it!</p>
</body>
</html>`;
      this.request.respond({
        headers: headers,
        body: new TextEncoder().encode(body),
      });
    };
  }
});
