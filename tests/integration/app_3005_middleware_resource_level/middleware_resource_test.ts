import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import MiddlewareResource from "./resources/middleware_resource.ts";
import { runServer } from "../test_utils.ts";

const server = new Drash.Http.Server({
  response_output: "application/json",
  resources: [
    MiddlewareResource,
  ],
});

Rhum.testPlan("middleware_resource_test.ts", () => {
  Rhum.testSuite("/middleware", () => {
    Rhum.testCase("resource-level token header is required", async () => {
      await runServer(server, { port: 3005 });
      let response;

      response = await members.fetch.get("http://localhost:3005/middleware", {
        headers: {
          "token": "zeToken",
        },
      });
      Rhum.asserts.assertEquals(
        await response.text(),
        '"You got changed from the middleware!"',
      );

      response = await members.fetch.get("http://localhost:3005/middleware");
      Rhum.asserts.assertEquals(await response.text(), '"No token, dude."');

      await server.close();
    });
  });
});

Rhum.run();
