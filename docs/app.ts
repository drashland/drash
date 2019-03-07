import Drash from "./bootstrap.ts";

import "./src/app_response.ts";
import AppResource from "./src/app_resource.ts";

// Create and run the server
let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "text/html",
  logger: Drash.Vendor.ConsoleLogger,
  resources: [AppResource],
  static_paths: ["/public"]
});

server.run();
