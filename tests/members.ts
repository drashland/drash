import { Drash } from "../mod.ts";
import {
  ServerRequest,
  assertEquals,
  assertThrows,
} from "../deps.ts";
const decoder = new TextDecoder("utf-8");
const testSuiteOutputLength = 20;

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
function mockRequest(url = "/", method = "get", options?: any): any {
  let request: any = new ServerRequest();
  request.url = url;
  request.method = method;
  request.headers = new Headers();
  if (options && options.headers) {
    for (let key in options.headers) {
      request.headers.set(key, options.headers[key]);
    }
  }

  //
  // Stub `respond()` so we don't run into the following error:
  //
  //   TypeError: Cannot read property 'write' of undefined
  //
  request.respond = function respond(output: any) {
    return output;
  };

  return request;
}

function assertResponseJsonEquals(actual: any, expected: any) {
  let response;
  try {
    response = assertEquals(JSON.parse(actual), expected);
  } catch (error) {
    response = assertEquals(actual, expected);
  }
  return response;
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
  assertEquals,
  assertResponseJsonEquals,
  assertThrows,
  currentTestSuite: "",
  decoder,
  fetch: makeRequest,
  mockRequest,
  responseBody: async function(response: any) {
    return decoder.decode(response.body);
  },
  test: function(name: string, testFn: any) {
    const numSpaces = testSuiteOutputLength - this.currentTestSuite.length;
    for ( let i = numSpaces; i >= 0; i-- ) {
      this.currentTestSuite += " ";
    }
    Deno.test(`${this.currentTestSuite} | Asserting: ${name}`, testFn);
  },
  testSuite: function(name: string, testFns: any) {
    this.currentTestSuite = name;
    testFns();
  },
};
