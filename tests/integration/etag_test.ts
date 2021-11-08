/**
 * This test addresses an issue where someone on the discord had their default
 * content type set, but on  browser requests the response  was "null". This is
 * because originally, the response class didn't fully take into account the
 * config AND the accept headers.  Essentially meaning, returning text/html (as
 * this was the first type on the request)
 */

import { Rhum } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";
import { EtagService } from "../../src/services/etag/etag.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class EtagResource extends Resource {
  paths = ["/etag"];

  public GET(_request: Request, response: Response) {
    response.text("hello");
  }
}

const server = new Server({
  resources: [
    EtagResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
  services: [new EtagService()],
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("browser_request_resource.ts", () => {
  Rhum.testSuite("GET /browser-request", () => {
    Rhum.testCase("Response should be JSON", async () => {
      server.run();
      // Example browser request
      const response = await fetch(
        `${server.address}/etag`,
      );
      await server.close();
      Rhum.asserts.assertEquals(await response.text(), "hello");
      const header = response.headers.get("etag") ?? "";
      console.log(header);
      Rhum.asserts.assert(header.match(/\"\d-.*\"/));
    });
  });
});

Rhum.run();
