// deno-lint-ignore-file
import { BufReader, ServerRequest } from "../deps.ts";
import { Drash, Rhum } from "./deps.ts";
const decoder = new TextDecoder("utf-8");

interface IMakeRequestOptions {
  body?: any;
  headers?: any;
  credentials?: any;
}

/**
 * Get a mocked request object.
 *
 * The reason there's a lot of `any`'s in this method is because
 * it's our own testing method, and we cannot compile if we use
 * the ServerRequest types. It isn't a problem though as
 * it's purely for testing
 *
 * @param string url
 * @param string method
 * @param any
 *     {
 *       headers: { [key: string]: string }
 *     }
 *
 * @returns A server request object (ServerRequest)
 */
// deno-lint-ignore no-explicit-any
export function mockRequest(url = "/", method = "get", options?: any): any {
  // deno-lint-ignore no-explicit-any
  let request: any = new ServerRequest(); // Type: ServerRequest, but can't type it so as we modify the request object (thus deferring from the original type)
  request.url = url;
  request.method = method;
  request.headers = new Headers();
  if (options) {
    if (options.headers) {
      for (let key in options.headers) {
        request.headers.set(key, options.headers[key]);
      }
    }
    if (options.body) {
      try {
        request.headers.set("Content-Length", options.body.length.toString());
      } catch (err) {
        // ... you *shall* pass
      }
      request.r = new BufReader(options.body);
    }
  }

  //
  // Stub `respond()` so we don't run into the following error:
  //
  //   TypeError: Cannot read property 'write' of undefined
  //
  request.respond = function respond(output: Drash.Deps.Response & { send?: () => Drash.Deps.Response | undefined}) {
    output.send = function () {
      if (
        output.status === 301 ||
        output.status === 302
      ) {
        return output;
      }
    };
    return output;
  };

  return request;
}

// deno-lint-ignore no-explicit-any
export function assertResponseJsonEquals(actual: any, expected: any) { // `any` because it's for testing, and the params could literally be anything
  let response;
  try {
    response = Rhum.asserts.assertEquals(JSON.parse(actual), expected);
  } catch (error) {
    response = Rhum.asserts.assertEquals(actual, expected);
  }
  return response;
}

export const makeRequest = {
  get(url: string, options: IMakeRequestOptions = {}) {
    options = Object.assign(options, {
      method: "GET",
    });
    options.body = JSON.stringify(options.body);
    return fetch(url, options);
  },
  post(url: string, options: IMakeRequestOptions = {}) {
    options = Object.assign(options, {
      method: "POST",
    });
    options.body = JSON.stringify(options.body);
    return fetch(url, options);
  },
  put(url: string, options: IMakeRequestOptions = {}) {
    options = Object.assign(options, {
      method: "PUT",
    });
    options.body = JSON.stringify(options.body);
    return fetch(url, options);
  },
  delete(url: string, options: IMakeRequestOptions = {}) {
    options = Object.assign(options, {
      method: "DELETE",
    });
    options.body = JSON.stringify(options.body);
    return fetch(url, options);
  },
  patch(url: string, options: IMakeRequestOptions = {}) {
    options = Object.assign(options, {
      method: "PATCH",
    });
    options.body = JSON.stringify(options.body);
    return fetch(url, options);
  },
};
