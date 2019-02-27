import Drash from "../mod.ts";
import Response from "./response.ts";
import resources from "/var/www/deno-drash/example-app/resources/.drash_http_resources.ts";

Drash.Http.Response = Response;

let server2 = new Drash.Http.Server({
  address: "localhost:8001",
  response_output: "application/json",
  resources: resources,
  log: {
    enabled: true
  }
});

server2.run();
