import Drash from "../mod.ts";
import Response from "./response.ts";
import HomeResource from "./resources/home_resource.ts";
import UsersResource from "./resources/users_resource.ts";

Drash.Http.Response = Response;

let server = new Drash.Http.Server({
  address: "localhost:1337",
  response_output: "application/json",
  resources: [HomeResource, UsersResource],
  logger: new Drash.Loggers.FileLogger({
    enabled: true,
    level: "info",
    file: "./tmp/log.log"
  })
});

server.run();
