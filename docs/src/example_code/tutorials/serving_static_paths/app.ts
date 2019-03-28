import Drash from "https://deno.land/x/drash/mod.ts";

import HomeResource from "./home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:8001",
  response_output: "text/html", // Accepts text/html, text/xml, application/xml, or other MIME types you define
  resources: [HomeResource],
  logger: new Drash.Loggers.ConsoleLogger({
    enabled: true,
    level: "debug"
  }),
  static_paths: ["/public"]
});

server.run();
