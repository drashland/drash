import { Rhum } from "../../deps.ts";
import { DexterService } from "../../../src/services/dexter/dexter.ts";

Rhum.testPlan("Dexter - mod_test.ts", () => {
  Rhum.testSuite("Dexter", () => {
    Rhum.testCase("is configurable", () => {
      let dexter = new DexterService();
      Rhum.asserts.assertEquals(dexter.configs.enabled, true);
      dexter = new DexterService({
        enabled: false,
      });
      Rhum.asserts.assertEquals(dexter.configs.enabled, false);
    });
    Rhum.testCase("logger and all of its log functions are exposed", () => {
      const dexter = new DexterService({
        enabled: true,
      });
      Rhum.asserts.assertEquals(typeof dexter.logger.debug, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.error, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.fatal, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.info, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.trace, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.warn, "function");
    });
    Rhum.testCase("logger can be used to write messages", () => {
      const dexter = new DexterService({
        enabled: true,
      });
      let actual;
      actual = dexter.logger.debug("test");
      Rhum.asserts.assertEquals(actual.match(/.*\[DEBUG\].*\s\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d \| \stest/)?.length, 1);
      actual = dexter.logger.error("test");
      Rhum.asserts.assertEquals(actual.match(/.*\[ERROR\].*\s\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d \| \stest/)?.length, 1);
      actual = dexter.logger.fatal("test");
      Rhum.asserts.assertEquals(actual.match(/.*\[FATAL\].*\s\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d \| \stest/)?.length, 1);
      actual = dexter.logger.info("test");
      Rhum.asserts.assertEquals(actual.match(/.*\[INFO\].*\s\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d \| \stest/)?.length, 1);
      actual = dexter.logger.trace("test");
      Rhum.asserts.assertEquals(actual.match(/.*\[TRACE\].*\s\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d \| \stest/)?.length, 1);
      actual = dexter.logger.warn("test");
      Rhum.asserts.assertEquals(actual.match(/.*\[WARN\].*\s\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d \| \stest/)?.length, 1);
    });
  });
});

Rhum.run();
