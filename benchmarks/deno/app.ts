import * as Drash from "../../mod.deno.ts";

import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

class HomeResource extends Drash.Resource {
  public paths = ["/"];

  public services = {
    GET: [
      new class Something {
        runAfterResource() {
        }

        runBeforeResource() {
        }

        runAtStartup() {
        }

        runOnError() {
        }
      }(),
    ],
  };

  public GET(
    _request: Drash.Request,
  ): Response {
    return new Response("Hello, Drash (Drash)!");
  }
}

const requestHandler = await Drash.createRequestHandler({
  resources: [
    HomeResource,
  ],
});

serve(
  (request: Request) => {
    return requestHandler.handleRequest(request);
  },
  {
    port: 1401,
    hostname: "localhost",
    onListen({ port, hostname }: { port: number; hostname: string }): void {
      console.log(`Drash server started at http://${hostname}:${port}`);
      console.log(`\nURLPattern: true\n`);
    },
  },
);

// serve((request) => new Response("Hello, Drash (Deno)!"), {
//   port: 1400,
//   hostname: "localhost",
//   onListen({ port, hostname }) {
//     console.log(`Drash server started at http://${hostname}:${port}`);
//     console.log(`\nURLPattern: true\n`);
//   },
// });

console.log("Health check: GET / - Begin");
const r = await fetch("http://localhost:1401");
console.log(await r.text());
console.log("Health check: GET / - End");
