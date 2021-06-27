import { Drash, Rhum, TestHelpers } from "../../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function HeaderTokenMiddleware(req: Drash.Request) {
  if (!req.getHeaderParam("token")) {
    throw new Drash.Errors.HttpError(
      400,
      "No token, dude.",
    );
  }
}

class HeaderTokenMiddlewareResource extends Drash.Resource {
  static paths = ["/middleware"];

  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }
}

const server = new Drash.Server({
  response_output: "application/json",
  middleware: {
    before_request: [
      HeaderTokenMiddleware,
    ],
  },
  resources: [
    HeaderTokenMiddlewareResource,
  ],
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("header_token_middleware_resource_test.ts", () => {
  Rhum.testSuite("/middleware", () => {
    Rhum.testCase("token header is required", async () => {
      await TestHelpers.runServer(server, { port: 3003 });
      let response;

      response = await TestHelpers.makeRequest.get("http://localhost:3003/middleware", {
        headers: {
          "token": "zeToken",
        },
      });
      Rhum.asserts.assertEquals(
        await response.text(),
        '"GET request received!"',
      );

      response = await TestHelpers.makeRequest.get("http://localhost:3003/middleware");
      Rhum.asserts.assertEquals(await response.text(), '"No token, dude."');

      await server.close();
    });
  });
});

Rhum.run();
