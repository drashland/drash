import { Rhum } from "../../test_deps.ts";
import { Morgan } from "../mod.ts";

Rhum.testPlan("mod.ts", () => {
  Rhum.testSuite("Morgan", () => {
    Rhum.testCase("is configurable", async () => {
      Morgan();
      Rhum.asserts.assertEquals(Morgan.prototype.configs.enabled, true);
      Morgan({
        enabled: false
      });
      Rhum.asserts.assertEquals(Morgan.prototype.configs.enabled, false);
    });
    Rhum.testCase("logger is exposed", () => {
      Morgan({
        enabled: true,
        test: true
      });
      Rhum.asserts.assertEquals(typeof Morgan.prototype.logger.info, "function");
    });
  });
});

Rhum.run();
