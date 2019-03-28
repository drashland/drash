import Drash from "https://deno.land/x/drash/mod.ts";

import HomeResource from "./home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "application/json",
  resources: [HomeResource]
});

server.run();
