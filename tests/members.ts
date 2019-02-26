import Drash from "../mod.ts";
import { test, assert } from "https://deno.land/x/std/testing/mod.ts";
import { ServerRequest } from "https://deno.land/std/http/server.ts";

let mockRequest = new ServerRequest();
mockRequest.headers = new Headers();

export default {
  Drash,
  ServerRequest,
  assert,
  test,
  mockRequest
};
