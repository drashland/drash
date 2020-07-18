import members from "../../members.ts";
import { Rhum } from "../../deps.ts";

Rhum.testPlan("middleware_resource_test.ts", () => {
  Rhum.testSuite("/middleware", () => {
    Rhum.testCase("resource-level token header is required", async () => {
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
    });
  });
});

Rhum.run();
