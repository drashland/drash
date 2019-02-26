import Drash from "../mod.ts";
import { test, assert } from "https://deno.land/x/std/testing/mod.ts";
import { ServerRequest } from "https://deno.land/std/http/server.ts";

let mockRequest = function mockRequest(
  url = "/",
  method = "get",
  headers?: any
) {
  let request = new ServerRequest();
  request.url = url;
  request.method = method;
  request.headers = new Headers();
  for (let key in headers) {
    request.headers.set(key, headers[key]);
  }
  return request;
};

export default {
  Drash,
  ServerRequest,
  assert,
  test,
  mockRequest,
};
