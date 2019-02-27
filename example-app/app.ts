import Drash from "../mod.ts";
import Response from "./response.ts";
import Homeresource from "./home_resource.ts";
import UsersResource from "./users_resource.ts";

// Drash.Http.Response = Response;

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "application/json",
  resources: [HomeResource, UsersResource],
  logger: new Drash.Loggers.ConsoleLogger({
    enabled: true,
    level: "info"
  })
});

server.run();
