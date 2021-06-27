/**
 * This test addresses an issue where someone on the discord had their default
 * content type set, but on  browser requests the response  was "null". This is
 * because originally, the response class didn't fully take into account the
 * config AND the accept headers.  Essentially meaning, returning text/html (as
 * this was the first type on the request)
 */

import { Drash, Rhum, TestHelpers } from "../../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class BrowserRequestResource extends Drash.Resource {
  static paths = ["/browser-request"];

  public GET() {
    this.response.body = {};
    return this.response;
  }
}

const server = new Drash.Server({
  response_output: "application/json",
  resources: [
    BrowserRequestResource,
  ],
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("browser_request_resource.ts", () => {
  Rhum.testSuite("GET /browser-request", () => {
    Rhum.testCase("Response should be JSON", async () => {
      await TestHelpers.runServer(server);

      // Example browser request
      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/browser-request",
      );
      Rhum.asserts.assertEquals(await response.text(), "{}"); // would be null
      Rhum.asserts.assertEquals(
        response.headers.get("Content-Type"),
        "application/json",
      );

      await server.close();
    });
  });
});

Rhum.run();
