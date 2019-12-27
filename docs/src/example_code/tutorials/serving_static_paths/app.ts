import Drash from "https://deno.land/x/drash/mod.ts";

import HomeResource from "./home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:1447",
  directory: "/private/var/src/deno-drash/docs/src/example_code/tutorials/serving_static_paths",
  resources: [HomeResource],
  response_output: "text/html",
  static_paths: ["/public"]
});

server.run();
