import Drash from "https://deno.land/x/drash/mod.ts";

let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "text/html",
  resources: [HomeResource]
});

server.run();
