import Drash from "https://deno.land/x/drash/mod.ts";

import HomeResource from "/path/to/your/project/home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "application/json",
  resources: [HomeResource],
  logger: new Drash.Loggers.FileLogger({
    enabled: true,
    level: "debug", // Accepts all, trace, debug, info, warn, error, fatal, and off
    file: "/path/to/your/project/.tmp/server.log"
  })
});

server.run();
