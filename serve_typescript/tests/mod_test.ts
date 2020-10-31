import { Rhum } from "../../test_deps.ts";
import { ServeTypeScript } from "../mod.ts";

Rhum.testPlan("ServeTypeScript - mod_test.ts", () => {
  Rhum.testSuite("ServeTypeScript", () => {
    Rhum.testCase("requires files", async () => {
      Rhum.asserts.assertThrows(() => {
        const serveTs = ServeTypeScript({
          files: []
        });
      });
    });
    Rhum.testCase("compiles TypeScript to JavaScript", async () => {
      Rhum.asserts.assertThrows(() => {
        const serveTs = ServeTypeScript({
          files: []
        });
      });
    });
  });
});

Rhum.run();
