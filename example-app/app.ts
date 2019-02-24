import Drash from '../drash.ts';

import Response from "./response.ts";
Drash.Response = Response;

import HomeResource from "./resources/home_resource.ts";

// let server = new Drash.Server({
//   response_output: 'text/html'
// });
let server = new Drash.Server({
  response_output: 'application/xml',
  resources: [
    HomeResource
  ]
});

server.run();
