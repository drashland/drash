import Drash from "https://deno.land/x/drash/mod.ts";

import HomeResource from "./home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "text/html",
  resources: [HomeResource],
  logger: new Drash.Loggers.FileLogger({
    level: "debug"
    file: ".tmp/server.log"
  })
});

server.run();
