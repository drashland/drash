import Drash from "https://deno.land/x/drash/mod.ts";

import UsersResource from "./users_resource.ts";

let server = new Drash.Http.Server({
  address: "localhost:1447",
  response_output: "application/json",
  resources: [UsersResource],
});

server.run();
