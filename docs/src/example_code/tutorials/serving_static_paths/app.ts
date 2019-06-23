import Drash from "https://deno.land/x/drash/mod.ts";

import HomeResource from "./home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:1337",
  directory: "/path/to/your/project",
  resources: [HomeResource],
  response_output: "text/html",
  static_paths: ["/public"]
});

server.run();
