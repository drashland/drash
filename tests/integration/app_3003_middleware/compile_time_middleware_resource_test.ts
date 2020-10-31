import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import CompileTimeMiddleware from "./middleware/compile_time_middleware.ts";
import CompileTimeMiddlewareResource from "./resources/compile_time_middleware_resource.ts";
import { runServer } from "../test_utils.ts";

const server = new Drash.Http.Server({
  response_output: "application/json",
  middleware: {
    before_request: [
      CompileTimeMiddleware,
    ],
  },
  resources: [
    CompileTimeMiddlewareResource,
  ],
});

Rhum.testPlan("compile_time_middleware_resource_test.ts", () => {
  Rhum.testSuite("/compile-time-middleware", () => {
    Rhum.testCase("changes the response body with compiled data", async () => {
      await runServer(server, { port: 3003 });
      let response;

      response = await members.fetch.get("http://localhost:3003/compile-time-middleware");
      Rhum.asserts.assertEquals(
        await response.text(),
        '"WE OUT HERE"',
      );

      await server.close();
    });
  });
});

Rhum.run();
