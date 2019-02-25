import Drash from "https://raw.githubusercontent.com/crookse/deno-drash/master/mod.ts"

import Response from "./response.ts";
Drash.Http.Response = Response;

import BaseResource from "./resource.ts";

import HomeResource from "./resources/home_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "application/json",
  resources: [HomeResource]
});

server.run();
