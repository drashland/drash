import { Rhum, TestHelpers } from "../../deps.ts";
import * as Drash from "../../../mod.ts"

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class InvalidReturningOfResponseResource extends Drash.DrashResource {
  static paths = ["/invalid/returning/of/response"];
  public GET() {
  }
  public POST() {
    return "hello";
  }
}

const server = new Drash.Server({
  resources: [
    InvalidReturningOfResponseResource,
  ],
  protocol: "http"
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
        await response.text(),
        '"The response must be returned inside the GET method of the InvalidReturningOfResponseResource class."',
      );
      Rhum.asserts.assertEquals(response.status, 418);
    });
    Rhum.testCase("Error is thrown when nothing is returned", async () => {
      server.run();

      const response = await TestHelpers.makeRequest.post(
        "http://localhost:3000/invalid/returning/of/response",
      );
      server.close();

      Rhum.asserts.assertEquals(
        await response.text(),
        '"The response must be returned inside the POST method of the InvalidReturningOfResponseResource class."',
      );
      Rhum.asserts.assertEquals(response.status, 418);
    });
  });
});

Rhum.run();
