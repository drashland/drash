import members from "../../members.ts";
import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";
import HeaderTokenMiddleware from "./middleware/header_token_middleware.ts";
import HeaderTokenMiddlewareResource from "./resources/header_token_middleware_resource.ts";
import { runServer } from "../test_utils.ts";

const server = new Drash.Http.Server({
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

Rhum.testPlan("header_token_middleware_resource_test.ts", () => {
  Rhum.testSuite("/middleware", () => {
    Rhum.testCase("token header is required", async () => {
      await runServer(server, { port: 3003 });
      let response;

      response = await members.fetch.get("http://localhost:3003/middleware", {
        headers: {
          "token": "zeToken",
        },
      });
      Rhum.asserts.assertEquals(
        await response.text(),
        '"GET request received!"',
      );

      response = await members.fetch.get("http://localhost:3003/middleware");
      Rhum.asserts.assertEquals(await response.text(), '"No token, dude."');

      await server.close();
    });
  });
});

Rhum.run();
