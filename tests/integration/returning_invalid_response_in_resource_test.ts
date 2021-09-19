import { Rhum, TestHelpers } from "../../deps.ts";
import * as Drash from "../../../mod.ts"
import { IContext, Resource} from "../../../mod.ts"

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class InvalidReturningOfResponseResource extends Resource {
  static paths = ["/invalid/returning/of/response"];
  public GET() {
  }
}

const server = new Drash.Server({
  resources: [
    InvalidReturningOfResponseResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("returning_invalid_response_in_resource_test.ts", () => {
  Rhum.testSuite("/invalid/returning/of/response", () => {
    Rhum.testCase("Error is thrown when nothing is returned", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/invalid/returning/of/response",
      );
      server.close();

      Rhum.asserts.assertEquals(
         (await response.text()).startsWith(
        'Error: The response body must be set from within a resource or service before the response is sent'), true)
      ;
      Rhum.asserts.assertEquals(response.status, 418);
    });
  });
});

Rhum.run();
