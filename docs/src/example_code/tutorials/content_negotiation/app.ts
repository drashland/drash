import Drash from "https://deno.land/x/drash/mod.ts";

// Replace `Drash.Http.Response` with your `Response` class
import Response from "./response.ts";
Drash.Http.Response = Response;

import UsersResource from "./users_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:1337",
  response_output: "application/json",
  resources: [UsersResource],
  logger: new Drash.Loggers.ConsoleLogger({
    enabled: true,
    level: "debug"
  })
});

server.run();
