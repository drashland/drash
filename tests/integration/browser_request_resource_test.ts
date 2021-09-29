/**
 * This test addresses an issue where someone on the discord had their default
 * content type set, but on  browser requests the response  was "null". This is
 * because originally, the response class didn't fully take into account the
 * config AND the accept headers.  Essentially meaning, returning text/html (as
 * this was the first type on the request)
 */

import { Rhum, TestHelpers } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class BrowserRequestResource extends Resource {
  paths = ["/browser-request"];

  public GET(_request: Request, response: Response) {
    response.text("hello");
  }
}

const server = new Server({
  resources: [
    BrowserRequestResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("browser_request_resource.ts", () => {
  Rhum.testSuite("GET /browser-request", () => {
    Rhum.testCase("Response should be JSON", async () => {
      server.run();
      // Example browser request
      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/browser-request",
        {
          headers: {
            Accept: "*/*",
          },
        },
      );
      server.close();
      Rhum.asserts.assertEquals(await response.text(), "hello");
      Rhum.asserts.assertEquals(
        response.headers.get("Content-Type"),
        "text/plain",
      );
    });
  });
});

Rhum.run();
