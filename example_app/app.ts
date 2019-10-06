import Drash from "../mod.ts";
import Response from "./response.ts";
import HomeResource from "./resources/home_resource.ts";
import UsersResource from "./resources/users_resource.ts";

Drash.Http.Response = Response;

let server = new Drash.Http.Server({
  address: "localhost:1337",
  response_output: "text/html",
  resources: [
    HomeResource,
    UsersResource
  ],
  logger: new Drash.Loggers.ConsoleLogger({
    enabled: true,
    level: "all",
    tag_string: "{level} |"
  })
});

server.run();
