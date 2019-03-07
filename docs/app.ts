import Drash from "./bootstrap.ts";

// Only one resource is needed because this app only has an index.html file
import Resource from "./src/resource.ts";

// Create and run the server
let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "text/html",
  logger: Drash.Vendor.ConsoleLogger,
  resources: [Resource],
  static_paths: ["/public"]
});

server.run();
