import { Rhum } from "../../test_deps.ts";
import { Dexter } from "../mod.ts";

Rhum.testPlan("Dexter - mod_test.ts", () => {
  Rhum.testSuite("Dexter", () => {
    Rhum.testCase("is configurable", () => {
      let dexter = Dexter();
      Rhum.asserts.assertEquals(dexter.configs.enabled, true);
      dexter = Dexter({
        enabled: false,
      });
      Rhum.asserts.assertEquals(dexter.configs.enabled, false);
    });
    Rhum.testCase("logger and all of its log functions are exposed", () => {
      const dexter = Dexter({
        enabled: true,
        test: true,
        tag_string: "{level} |",
      });
      Rhum.asserts.assertEquals(typeof dexter.logger.debug, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.error, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.fatal, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.info, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.trace, "function");
      Rhum.asserts.assertEquals(typeof dexter.logger.warn, "function");
    });
    Rhum.testCase("logger can be used to write messages", () => {
      const dexter = Dexter({
        enabled: true,
        level: "all",
        test: true,
        tag_string: "{level} |",
      });
      let actual;
      actual = dexter.logger.debug("test");
      Rhum.asserts.assertEquals(actual, "DEBUG | test");
      actual = dexter.logger.error("test");
      Rhum.asserts.assertEquals(actual, "ERROR | test");
      actual = dexter.logger.fatal("test");
      Rhum.asserts.assertEquals(actual, "FATAL | test");
      actual = dexter.logger.info("test");
      Rhum.asserts.assertEquals(actual, "INFO | test");
      actual = dexter.logger.trace("test");
      Rhum.asserts.assertEquals(actual, "TRACE | test");
      actual = dexter.logger.warn("test");
      Rhum.asserts.assertEquals(actual, "WARN | test");
    });
  });
});

Rhum.run();
