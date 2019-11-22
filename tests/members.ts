import Drash from "../mod.ts";
import { ServerRequest, assertEquals, runTests, test } from "../deno_std.ts";
const decoder = new TextDecoder("utf-8");

/**
 * Get a mocked request object.
 */
function mockRequest(
  url = "/",
  method = "get",
  headers?: any,
  hydrate = true
): any {
  let request = new ServerRequest();
  request.url = url;
  request.method = method;
  request.headers = new Headers();
  if (hydrate) {
    request = Drash.Services.HttpService.hydrateHttpRequest(request, {
      headers: headers
    });
  }

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
};

/**
 * Get a mocked server object.
 */
class MockServer extends Drash.Http.Server {
}

function responseJsonEquals(actual: any, expected: any) {
  return assertEquals(
    JSON.parse(decoder.decode(actual)),
    expected
  );
}

function runTest(name, testFn) {
  Object.defineProperty(testFn, "name", { value: name });
  return test(testFn);
}

export default {
  Drash,
  ServerRequest,
  assert: {
    equal: assertEquals,
    responseJsonEquals: responseJsonEquals
  },
  decoder,
  mockRequest,
  MockServer,
  runTests,
  test: runTest,
};
