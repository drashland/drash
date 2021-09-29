import { Rhum, TestHelpers } from "../deps.ts";
import { Request, Resource, Response, Server } from "../../mod.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class HomeResource extends Resource {
  paths = ["/", "/home"];

  public GET(_request: Request, response: Response) {
    response.text("GET request received!");
  }

  public POST(_request: Request, response: Response) {
    response.text("POST request received!");
  }

  public PUT(_request: Request, response: Response) {
    response.text("PUT request received!");
  }

  public DELETE(_request: Request, response: Response) {
    response.text("DELETE request received!");
  }
}

const server = new Server({
  resources: [
    HomeResource,
  ],
  protocol: "http",
  hostname: "localhost",
  port: 3000,
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("home_resource_test.ts", () => {
  Rhum.testSuite("/", () => {
    Rhum.testCase("only defined methods are accessible", async () => {
      server.run();

      let response;

      response = await TestHelpers.makeRequest.get("http://localhost:3000", {
        headers: {
          Accept: "text/plain",
        },
      });
      Rhum.asserts.assertEquals(
        await response.text(),
        "GET request received!",
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/home",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        "GET request received!",
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/home/",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        "GET request received!",
      );

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3000/home//",
        {
          headers: {
            Accept: "text/plain",
          },
        },
      );
      Rhum.asserts.assertEquals(
        (await response.text()).startsWith("Error: Not Found"),
        true,
      );

      response = await TestHelpers.makeRequest.post("http://localhost:3000", {
        headers: {
          Accept: "text/plain",
        },
      });
      Rhum.asserts.assertEquals(
        await response.text(),
        "POST request received!",
      );

      response = await TestHelpers.makeRequest.put("http://localhost:3000", {
        headers: {
          Accept: "text/plain",
        },
      });
      Rhum.asserts.assertEquals(
        await response.text(),
        "PUT request received!",
      );

      response = await TestHelpers.makeRequest.delete("http://localhost:3000", {
        headers: {
          Accept: "text/plain",
        },
      });
      Rhum.asserts.assertEquals(
        await response.text(),
        "DELETE request received!",
      );

      response = await TestHelpers.makeRequest.patch("http://localhost:3000", {
        headers: {
          Accept: "text/plain",
        },
      });
      Rhum.asserts.assertEquals(
        (await response.text()).startsWith("Error: Method Not Allowed"),
        true,
      );

      server.close();
    });
  });
});

Rhum.run();
