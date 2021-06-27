import { Drash, Rhum, TestHelpers } from "../../deps.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - APP SETUP /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function CompileTimeMiddleware() {
  const compiledStuff: string[] = [];

  async function compile(): Promise<void> {
    compiledStuff.push("WE OUT HERE");
  }

  async function run(
    request: Drash.Request,
    response: Drash.Response,
  ): Promise<void> {
    if (request.url == "/compile-time-middleware") {
      response.body = compiledStuff[0];
    }
  }
  return {
    compile,
    run,
  };
}

class CompileTimeMiddlewareResource extends Drash.Resource {
  static paths = ["/compile-time-middleware"];

  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }
}

const server = new Drash.Server({
  response_output: "application/json",
  middleware: {
    compile_time: [
      CompileTimeMiddleware(),
    ],
  },
  resources: [
    CompileTimeMiddlewareResource,
  ],
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - TESTS /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

Rhum.testPlan("compile_time_middleware_resource_test.ts", () => {
  Rhum.testSuite("/compile-time-middleware", () => {
    Rhum.testCase("changes the response body with compiled data", async () => {
      await TestHelpers.runServer(server, { port: 3003 });
      let response;

      response = await TestHelpers.makeRequest.get(
        "http://localhost:3003/compile-time-middleware",
      );
      Rhum.asserts.assertEquals(
        await response.text(),
        '"WE OUT HERE"',
      );

      await server.close();
    });
  });
});

Rhum.run();
