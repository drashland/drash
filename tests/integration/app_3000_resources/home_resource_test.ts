import { Rhum, TestHelpers } from "../../deps.ts";
import * as Drash from "../../../mod.ts"
import { IContext, Resource } from "../../../mod.ts"

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class HomeResource extends Drash.DrashResource {
  static paths = ["/", "/home"];

  public GET(context: IContext) {
    context.response.body = "GET request received!";
  }

  public POST(context: IContext) {
    context.response.body = "POST request received!";
  }

  public PUT(context: IContext) {
    context.response.body = "PUT request received!";
  }

  public DELETE(context: IContext) {
    context.response.body = "DELETE request received!";
  }
}

const server = new Drash.Server({
  resources: [
    HomeResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("home_resource_test.ts", () => {
  Rhum.testSuite("/", () => {
    Rhum.testCase("only defined methods are accessible", async () => {
      server.run();

      let response;

      response = await TestHelpers.makeRequest.get("http://localhost:3000");
      Rhum.asserts.assertEquals(
        await response.text(),
        'GET request received!',
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/home",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        'GET request received!',
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/home/",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        'GET request received!',
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/home//",
      );
      Rhum.asserts.assertEquals((await response.text()).startsWith('Error: Not Found'), true);

      response = await TestHelpers.makeRequest.post("http://localhost:3000");
      Rhum.asserts.assertEquals(
        await response.text(),
        'POST request received!',
      );

      response = await TestHelpers.makeRequest.put("http://localhost:3000");
      Rhum.asserts.assertEquals(
        await response.text(),
        'PUT request received!',
      );

      response = await TestHelpers.makeRequest.delete("http://localhost:3000");
      Rhum.asserts.assertEquals(
        await response.text(),
        'DELETE request received!',
      );

      response = await TestHelpers.makeRequest.patch("http://localhost:3000");
      Rhum.asserts.assertEquals((await response.text()).startsWith("Error: Method Not Allowed"), true);

      server.close();
    });
  });
});

Rhum.run();
