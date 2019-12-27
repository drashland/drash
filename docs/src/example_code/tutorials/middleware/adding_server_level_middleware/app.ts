import Drash from "https://deno.land/x/drash/mod.ts";

import HomeResource from "./home_resource.ts";
import VerifyTokenMiddleware from "./verify_token_middleware.ts";

let server = new Drash.Http.Server({
  address: "localhost:1447",
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
