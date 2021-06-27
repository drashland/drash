import { Drash, Rhum, TestHelpers } from "../../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function ChangeResponseMiddleware(
  req: Drash.Request,
  res?: Drash.Response,
) {
  if (res) {
    res.body = "You got changed from the middleware!";
  }
}

function HeaderTokenMiddleware(req: Drash.Request) {
  if (!req.getHeaderParam("token")) {
    throw new Drash.Errors.HttpError(
      400,
      "No token, dude.",
    );
  }
}

@Drash.Middleware({
  before_request: [HeaderTokenMiddleware],
  after_request: [],
})
class MiddlewareResource extends Drash.Resource {
  static paths = ["/middleware"];

  @Drash.Middleware({
    after_request: [ChangeResponseMiddleware],
  })
  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }
}

const server = new Drash.Server({
  response_output: "application/json",
  resources: [
    MiddlewareResource,
  ],
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("middleware_resource_test.ts", () => {
  Rhum.testSuite("/middleware", () => {
    Rhum.testCase("resource-level token header is required", async () => {
      await TestHelpers.runServer(server, { port: 3005 });
      let response;

      response = await TestHelpers.makeRequest.get("http://localhost:3005/middleware", {
        headers: {
          "token": "zeToken",
        },
      });
      Rhum.asserts.assertEquals(
        await response.text(),
        '"You got changed from the middleware!"',
      );

      response = await TestHelpers.makeRequest.get("http://localhost:3005/middleware");
      Rhum.asserts.assertEquals(await response.text(), '"No token, dude."');

      await server.close();
    });
  });
});

Rhum.run();
