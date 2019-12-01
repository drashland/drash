// import Drash from "https://deno.land/x/drash/mod.ts";
import Drash from "../../../../../../mod.ts";

import HomeResource from "./home_resource.ts";
import VerifyTokenMiddleware from "./verify_token_middleware.ts";

let server = new Drash.Http.Server({
  address: "localhost:1447",
  logger: new Drash.Loggers.ConsoleLogger({enabled: true, level: "debug"}),
  middleware: {
    server_level: {
      before_request: [
        VerifyTokenMiddleware
      ]
    }
  },
  resources: [
    HomeResource
  ],
  response_output: "application/json",
});

server.run();
