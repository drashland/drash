import { Drash } from "../../deps.ts";
import { Rhum, mockRequest } from "../../test_deps.ts";
import { ServeTypeScript } from "../mod.ts";

Rhum.testPlan("ServeTypeScript - mod_test.ts", () => {
  Rhum.testSuite("ServeTypeScript", () => {
    Rhum.testCase("requires files", async () => {
      Rhum.asserts.assertThrows(() => {
        ServeTypeScript({
          files: [],
        });
      });
    });
    Rhum.testCase("compiles TypeScript to JavaScript", async () => {
      const drashRequest = new Drash.Http.Request(mockRequest("/assets/compiled.ts"));
      const drashResponse = new Drash.Http.Response(drashRequest);
      const serveTs = ServeTypeScript({
        files: [
          {
            source: "./serve_typescript/tests/data/my_ts.ts",
            target: "/assets/compiled.ts"
          }
        ]
      });
      await serveTs.compile();
      await serveTs.run(
        drashRequest,
        drashResponse
      );
      Rhum.asserts.assertEquals(
        drashResponse.body,
        `"use strict";\nfunction greet(name) {\n    return "Hello, " + name;\n}\n`
      );
    });
  });
});

Rhum.run();
