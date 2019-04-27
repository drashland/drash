import Drash from "https://deno.land/x/drash/mod.ts";

// Optional: You can add the DRASH_SERVER_DIRECTORY environment variable using
// the below code if you prefer not to add it using the terminal.
//
// Deno.env().DRASH_SERVER_DIRECTORY = "/path/to/your/project";

import HomeResource from "./home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:1337",
  directory: "/path/to/your/project",
  resources: [HomeResource],
  response_output: "text/html",
  static_paths: ["/public"]
});

server.run();
