import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import { AfterResourceMiddleware } from "./middleware/after_resource_middleware.ts";
import { AfterResourceMiddlewareResource } from "./resources/after_resource_middleware_resource.ts";
import { runServer } from "../test_utils.ts";

const server = new Drash.Http.Server({
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

Rhum.testPlan("after_resource_middleware_resource_test.ts", () => {
  Rhum.testSuite("/template-engine-middleware", () => {
    Rhum.testCase("response.render is changed by the middleware", async () => {
      await runServer(server, { port: 3003 });
      let response;

      response = await members.fetch.get("http://localhost:3003/template-engine-middleware");
      Rhum.asserts.assertEquals(
        await response.text(),
        "[\"hello\",{\"what\":\"ok\"}]",
      );

      await server.close();
    });
  });
});

Rhum.run();

