import Drash from "https://deno.land/x/drash/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

export default class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];

  public GET() {
    log.info("Setting a response.");
    this.response.body = "Hello!";
    return this.response;
  }
}

let server = new Drash.Http.Server({
  address: "localhost:1337",
  response_output: "application/json",
  resources: [HomeResource]
});

server.run();
