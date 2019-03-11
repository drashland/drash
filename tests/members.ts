import Drash from "../mod.ts";
import CONF from "./test_conf.json";
import { runTests, test } from "https://deno.land/x/std/testing/mod.ts";
import * as asserts from "https://deno.land/x/std/testing/asserts.ts";
import { ServerRequest } from "https://deno.land/std/http/server.ts";
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
  CONF,
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
