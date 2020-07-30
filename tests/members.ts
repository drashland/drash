// deno-lint-ignore-file
import { Drash } from "../mod.ts";
import {
  BufReader,
  ServerRequest,
} from "../deps.ts";
import { Rhum } from "./deps.ts";
const decoder = new TextDecoder("utf-8");

// deno-lint-ignore no-explicit-any
function createDrashRequest(
  url: string = "/",
  method: string = "get",
  options?: any,
): Drash.Http.Request {
  const request = mockRequest(url, method, options);
  const drashRequest = new Drash.Http.Request(request);
  return drashRequest;
}

/**
 * Get a mocked request object.
 *
 * @param string url
 * @param string method
 * @param any
 *     {
 *       headers: { [key: string]: string }
 *     }
 */
// deno-lint-ignore no-explicit-any
function mockRequest(url = "/", method = "get", options?: any): any {
  // deno-lint-ignore no-explicit-any
  let request: any = new ServerRequest();
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
  request.respond = function respond(output: Drash.Interfaces.ResponseOutput) {
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

interface IMakeRequestOptions {
  body?: any;
  headers?: any;
  credentials?: any;
}

// deno-lint-ignore no-explicit-any
function assertResponseJsonEquals(actual: any, expected: any) {
  let response;
  try {
    response = Rhum.asserts.assertEquals(JSON.parse(actual), expected);
  } catch (error) {
    response = Rhum.asserts.assertEquals(actual, expected);
  }
  return response;
}

const makeRequest = {
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

export default {
  BufReader,
  ServerRequest,
  assertResponseJsonEquals,
  currentTestSuite: "",
  decoder,
  fetch: makeRequest,
  mockRequest,
  responseBody: function (response: Drash.Interfaces.ResponseOutput) {
    return decoder.decode(response.body as ArrayBuffer);
  },
  createDrashRequest,
};
