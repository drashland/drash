import { Drash } from "../mod.ts";
import {
  ServerRequest,
  assertEquals,
  assertThrows,
} from "../deps.ts";
const decoder = new TextDecoder("utf-8");

/**
 * Get a mocked request object.
 */
function mockRequest(url = "/", method = "get", headers?: any): any {
  let request: any = new ServerRequest();
  request.url = url;
  request.method = method;
  request.headers = new Headers();
  request = new Drash.Services.HttpRequestService().hydrate(request, {
    headers: headers,
  });

  //
  // Stub `respond()` so we don't run into the following error:
  //
  //   TypeError: Cannot read property 'write' of undefined
  //   at BufWriter.flush (bufio.ts:446:25)
  //   at writeResponse (server.ts:97:16)
  //   at async Request.respond (server.ts:197:5)
  //
  request.respond = function respond(output: any) {
    return output;
  };

  return request;
}

/**
 * Get a mocked server object.
 */
class MockServer extends Drash.Http.Server {}

function responseJsonEquals(actual: any, expected: any) {
  return assertEquals(JSON.parse(actual), expected);
}

const makeRequest = {
  get(url: string, options: any = {}) {
    options = Object.assign(options, {
      method: "GET",
    });
    options.body = JSON.stringify(options.body);
    return fetch(url, options);
  },
  post(url: string, options: any = {}) {
    options = Object.assign(options, {
      method: "POST",
    });
    options.body = JSON.stringify(options.body);
    return fetch(url, options);
  },
  put(url: string, options: any = {}) {
    options = Object.assign(options, {
      method: "PUT",
    });
    options.body = JSON.stringify(options.body);
    return fetch(url, options);
  },
  delete(url: string, options: any = {}) {
    options = Object.assign(options, {
      method: "DELETE",
    });
    options.body = JSON.stringify(options.body);
    return fetch(url, options);
  },
  patch(url: string, options: any = {}) {
    options = Object.assign(options, {
      method: "PATCH",
    });
    options.body = JSON.stringify(options.body);
    return fetch(url, options);
  },
};

export default {
  Drash,
  ServerRequest,
  assert: {
    equal: assertEquals,
    equals: assertEquals,
    throws: assertThrows,
    responseJsonEquals: responseJsonEquals,
  },
  decoder,
  fetch: makeRequest,
  mockRequest,
  MockServer,
  test: Deno.test,
};
