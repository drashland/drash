import Drash from "../mod.ts";
import { Decoder, Http } from "../system.ts";
import { runTests, test } from "https://deno.land/x/std/testing/mod.ts";
import * as asserts from "https://deno.land/x/std/testing/asserts.ts";
const decoder = new Decoder("utf-8");

let mockRequest = function mockRequest(
  url = "/",
  method = "get",
  headers?: any,
  hydrate = true
): any {
  let request = new Http.Request();
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
  assert: {
    equal: asserts.assertEquals
  },
  decoder,
  mockRequest,
  runTests,
  test
};
