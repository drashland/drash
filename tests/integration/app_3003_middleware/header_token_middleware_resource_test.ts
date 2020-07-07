import members from "../../members.ts";
import { Rhum } from "../../deps.js";

Rhum.testPlan("header_token_middleware_resource_test.ts", () => {
  Rhum.testSuite("/middleware", () => {
    Rhum.testCase("token header is required", async () => {
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
    });
  });
});

Rhum.run();
