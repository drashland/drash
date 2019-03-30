import Drash from "../mod.ts";
import { runTests, test } from "https://deno.land/x/std/testing/mod.ts";
import * as asserts from "https://deno.land/x/std/testing/asserts.ts";
import { ServerRequest } from "https://deno.land/x/http/server.ts";
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
  let drashRequest = new Drash.Http.Request(request);
  if (hydrate) {
    drashRequest = Drash.Services.HttpService.hydrateHttpRequest(drashRequest, {
      headers: headers
    });
  }
  return drashRequest;
};

export default {
  Drash,
  ServerRequest,
  assert: {
    equal: asserts.assertEquals
  },
  decoder,
  mockRequest,
  runTests,
  test
};
