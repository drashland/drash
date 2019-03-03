import Drash from "../mod.ts";
import { runTests, test, assert } from "https://deno.land/x/std/testing/mod.ts";
import { ServerRequest } from "https://deno.land/std/http/server.ts";
import conf from "../.conf/conf.ts";
const decoder = new TextDecoder("utf-8");

// No cur dir? Set cur dir...
if (!Drash.getEnvVar("cur_dir").value) {
  Drash.setEnvVar("cur_dir", conf.tests.cur_dir);
  console.log(Drash.getEnvVar("cur_dir"));
}

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
  assert,
  decoder,
  test,
  mockRequest,
  runTests
};
