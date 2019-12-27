import Drash from "https://deno.land/x/drash/mod.ts";

import HomeResource from "./home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:1447",
  response_output: "application/json", // Accepts text/html, text/xml, application/xml
  resources: [HomeResource],
});

server.run();
