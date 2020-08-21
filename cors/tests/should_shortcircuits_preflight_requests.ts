import { Rhum } from "../../test_deps.ts";

Rhum.testPlan("should_shortcircuits_preflight_requests.ts", () => {
  Rhum.testSuite("/middleware", () => {
    Rhum.testCase("Should shortcircuits preflight requests", async () => {
      let response;

      response = await fetch("http://localhost:3003/middleware", {
        method: "OPTIONS",
        headers: {
          "Origin": "localhost",
          "Access-Control-Request-Method": "GET",
        },
      });

      Rhum.asserts.assertEquals(
        response.status,
        204,
      );
      Rhum.asserts.assertEquals(
        response.headers.get("access-control-allow-origin"),
        "*",
      );
      Rhum.asserts.assertEquals(
        response.headers.get("access-control-allow-methods"),
        "GET,HEAD,PUT,PATCH,POST,DELETE",
      );
      Rhum.asserts.assertEquals(response.headers.get("vary"), "origin");
      Rhum.asserts.assertEquals(response.headers.get("content-length"), "0");
    });
  });
});
