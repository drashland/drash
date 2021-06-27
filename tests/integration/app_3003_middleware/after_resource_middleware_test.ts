import { Drash, Rhum, TestHelpers } from "../../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function AfterResourceMiddleware(
  req: Drash.Request,
  res: Drash.Response,
) {
  res.render = (...args: unknown[]): string | boolean => {
    res.headers.set("Content-Type", "text/html");
    return JSON.stringify(args);
  };
}

class AfterResourceMiddlewareResource extends Drash.Resource {
  static paths = ["/template-engine-middleware"];

  public GET() {
    this.response.body = this.response.render("hello", { what: "ok" });
    return this.response;
  }
}

const server = new Drash.Server({
  response_output: "application/json",
  middleware: {
    after_resource: [
      AfterResourceMiddleware,
    ],
  },
  resources: [
    AfterResourceMiddlewareResource,
  ],
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("after_resource_middleware_resource_test.ts", () => {
  Rhum.testSuite("/template-engine-middleware", () => {
    Rhum.testCase("response.render is changed by the middleware", async () => {
      await TestHelpers.runServer(server, { port: 3003 });
      let response;

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3003/template-engine-middleware",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '["hello",{"what":"ok"}]',
      );

      await server.close();
    });
  });
});

Rhum.run();
