import Drash from "../../../mod.ts";

import { test, assert } from "https://deno.land/x/std/testing/mod.ts";
import { ServerRequest } from "https://deno.land/std/http/server.ts";

class MyResource extends Drash.Http.Resource {
  public GET() {
    this.response.body = "got";
    return this.response;
  }
}

let request = new ServerRequest();
request.headers = new Headers();
let resource = new MyResource(request, new Drash.Http.Response(request));
let response = resource.GET();

test(async function DrashHttpResource() {
  assert.equal(response.body, "got");
});
