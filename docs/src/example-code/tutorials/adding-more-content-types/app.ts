import Drash from "https://deno.land/x/drash/mod.ts";

// Replace `Drash.Http.Response` with your `Response` class
import Response from "./response.ts";
Drash.Http.Response = Response;

import HomeResource from "./home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "text/html",
  resources: [HomeResource],
  logger: new Drash.Loggers.ConsoleLogger({
    enabled: true,
    level: "debug"
  })
});

server.run();
