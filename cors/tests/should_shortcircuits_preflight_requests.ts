import { Rhum } from "../../test_deps.ts";

Rhum.testPlan("should_shortcircuits_preflight_requests.ts", () => {
  Rhum.testSuite("/middleware", () => {
    Rhum.testCase("Should shortcircuits preflight requests", async () => {
      let response;

      response = await fetch("http://localhost:3003/middleware", {
        method: "OPTIONS",
      });

      Rhum.asserts.assertEquals(
        response.headers,
        {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          vary: 'Origin, Access-Control-Request-Headers',
          'content-length': '0'
        },
      );
    });
  });
});
