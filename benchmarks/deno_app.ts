import * as Drash from "../mod.deno.ts";

import { serve } from "https://deno.land/std@0.158.0/http/server.ts";

class HomeResource extends Drash.Resource {
  public paths = ["/"];

  public GET(
    request: Drash.Request,
    response: Drash.Response,
  ): Drash.Response {
    return response.body("Hello, Drash (NP)!");
  }
}

const requestHandler = await Drash.createRequestHandler({
  resources: [
    HomeResource,
  ],
});

serve((request) => requestHandler.handle(request), {
  port: 1401,
  hostname: "localhost",
  onListen({ port, hostname }) {
    console.log(`Drash server started at http://${hostname}:${port}`);
    console.log(`\nURLPattern: true\n`);
  },
});

serve((request) => new Response("Hello, Drash (NP)!"), {
  port: 1400,
  hostname: "localhost",
  onListen({ port, hostname }) {
    console.log(`Drash server started at http://${hostname}:${port}`);
    console.log(`\nURLPattern: true\n`);
  },
});
