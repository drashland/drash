import { serve } from "https://deno.land/x/http/server.ts";
const s = serve("127.0.0.1:8000");

const REGEX_URI_MATCHES = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, 'g');
const REGEX_URI_REPLACEMENT = '([^/]+)';

const Resource = {};

async function main() {
  for await (const request of s) {
    console.log(`Request received: ${request.method.toUpperCase()} ${request.url}`);

    let resource = getResourceClass(request);
    resource = new resource();
    resource.request = request;
    resource['HTTP_GET_TEXT']();
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

main();

addHttpResource({
  paths: ['/hello'],
  class: function HelloResource() {
    this.HTTP_GET_TEXT = () => {
      this.request.respond({ body: new TextEncoder().encode("Hello World\n") });
    };
  }
});
