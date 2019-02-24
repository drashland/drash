import Drash from '../mod.ts';

import Response from "./response.ts";
Drash.Http.Response = Response;

import HomeResource from "./resources/home_resource.ts";

let server = new Drash.Http.Server({
  response_output: 'application/pdf',
  resources: [
    HomeResource
  ]
});

server.run();
