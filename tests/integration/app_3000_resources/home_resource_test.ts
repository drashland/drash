import { Drash, Rhum, TestHelpers } from "../../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class HomeResource extends Drash.Resource {
  static paths = ["/", "/home"];

  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }

  public POST() {
    this.response.body = "POST request received!";
    return this.response;
  }

  public PUT() {
    this.response.body = "PUT request received!";
    return this.response;
  }

  public DELETE() {
    this.response.body = "DELETE request received!";
    return this.response;
  }
}

const server = new Drash.Server({
  resources: [
    HomeResource,
  ],
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("home_resource_test.ts", () => {
  Rhum.testSuite("/", () => {
    Rhum.testCase("only defined methods are accessible", async () => {
      await TestHelpers.runServer(server);

      let response;

      response = await TestHelpers.makeRequest.get("http://localhost:3000");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"GET request received!"',
      );

      response = await TestHelpers.makeRequest.get("http://localhost:3000/home");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"GET request received!"',
      );

      response = await TestHelpers.makeRequest.get("http://localhost:3000/home/");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"GET request received!"',
      );

      response = await TestHelpers.makeRequest.get("http://localhost:3000/home//");
      Rhum.asserts.assertEquals(await response.text(), '"Not Found"');

      response = await TestHelpers.makeRequest.post("http://localhost:3000");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"POST request received!"',
      );

      response = await TestHelpers.makeRequest.put("http://localhost:3000");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"PUT request received!"',
      );

      response = await TestHelpers.makeRequest.delete("http://localhost:3000");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"DELETE request received!"',
      );

      response = await TestHelpers.makeRequest.patch("http://localhost:3000");
      Rhum.asserts.assertEquals(await response.text(), '"Method Not Allowed"');

      await server.close();
    });
  });
});

Rhum.run();
