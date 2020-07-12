import { Rhum } from "../../test_deps.ts";
import { Morgan } from "../mod.ts";

Rhum.testPlan("Morgan - mod_test.ts", () => {
  Rhum.testSuite("Morgan", () => {
    Rhum.testCase("is configurable", async () => {
      let morgan = Morgan();
      Rhum.asserts.assertEquals(morgan.configs.enabled, true);
      morgan = Morgan({
        enabled: false,
      });
      Rhum.asserts.assertEquals(morgan.configs.enabled, false);
    });
    Rhum.testCase("logger and all of its log functions are exposed", () => {
      let morgan = Morgan({
        enabled: true,
        test: true,
        tag_string: "{level} |"
      });
      Rhum.asserts.assertEquals(typeof morgan.logger.debug, "function");
      Rhum.asserts.assertEquals(typeof morgan.logger.error, "function");
      Rhum.asserts.assertEquals(typeof morgan.logger.fatal, "function");
      Rhum.asserts.assertEquals(typeof morgan.logger.info, "function");
      Rhum.asserts.assertEquals(typeof morgan.logger.trace, "function");
      Rhum.asserts.assertEquals(typeof morgan.logger.warn, "function");
    });
    Rhum.testCase("logger can be used to write messages", () => {
      let morgan = Morgan({
        enabled: true,
        level: "all",
        test: true,
        tag_string: "{level} |"
      });
      let actual;
      actual = morgan.logger.debug("test");
      Rhum.asserts.assertEquals(actual, "DEBUG | test");
      actual = morgan.logger.error("test");
      Rhum.asserts.assertEquals(actual, "ERROR | test");
      actual = morgan.logger.fatal("test");
      Rhum.asserts.assertEquals(actual, "FATAL | test");
      actual = morgan.logger.info("test");
      Rhum.asserts.assertEquals(actual, "INFO | test");
      actual = morgan.logger.trace("test");
      Rhum.asserts.assertEquals(actual, "TRACE | test");
      actual = morgan.logger.warn("test");
      Rhum.asserts.assertEquals(actual, "WARN | test");
    });
  });
});

Rhum.run();
