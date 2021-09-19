/**
 * This test addresses an issue where someone on the discord had their default
 * content type set, but on  browser requests the response  was "null". This is
 * because originally, the response class didn't fully take into account the
 * config AND the accept headers.  Essentially meaning, returning text/html (as
 * this was the first type on the request)
 */

import { Rhum, TestHelpers } from "../../deps.ts";
import * as Drash from "../../../mod.ts"

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class BrowserRequestResource extends Drash.DrashResource {
  static paths = ["/browser-request"];

  public GET() {
    this.response.body = null;
    return this.response;
  }
}

const server = new Drash.Server({
  default_response_type: "application/json",
  resources: [
    BrowserRequestResource,
  ],
  protocol: "http"
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
      );
      Rhum.asserts.assertEquals(await response.text(), "null"); // would be null
      Rhum.asserts.assertEquals(
        response.headers.get("Content-Type"),
        "application/json",
      );
      server.close();
    });
  });
});

Rhum.run();
