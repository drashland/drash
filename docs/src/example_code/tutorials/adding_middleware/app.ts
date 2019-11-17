import Drash from "https://deno.land/x/drash/mod.ts";

import HomeResource from "./resources/home_resource.ts";
import VerifyToken from "./middleware/verify_token.ts";

let server = new Drash.Http.Server({
  address: "localhost:8000",
  logger: new Drash.Loggers.ConsoleLogger({enabled: true, level: "debug"}),
  middleware: [VerifyToken],
  resources: [HomeResource],
  response_output: "application/json",
});

server.run();
