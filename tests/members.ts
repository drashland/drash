import Drash from "../mod.ts";
import { ServerRequest, assertEquals, runTests, test } from "../deno_std.ts";
const decoder = new TextDecoder("utf-8");

let mockRequest = function mockRequest(
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
  return request;
};

export default {
  Drash,
  ServerRequest,
  assert: {
    equal: assertEquals
  },
  decoder,
  mockRequest,
  runTests,
  test
};
