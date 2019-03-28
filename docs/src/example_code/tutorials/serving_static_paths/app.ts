import Drash from "https://deno.land/x/drash/mod.ts";

import HomeResource from "./home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:8001",
  directory: "/path/to/your/project",
  logger: new Drash.Loggers.ConsoleLogger({ enabled: true, level: "debug" }),
  resources: [HomeResource],
  response_output: "text/html",
  static_paths: ["/public"]
});

server.run();
