import { Rhum } from "../../deps.ts";
import { Drash } from "../../../mod.ts";

const ANIMALS = {
  "#1235": "tiger",
};

Rhum.testPlan("core_loggers/console_logger.ts", () => {
  Rhum.testSuite("ConsoleLogger", () => {
    Rhum.testCase("logs correctly", () => {
      let logger = new Drash.CoreLoggers.ConsoleLogger({
        test: true,
        enabled: true,
        level: "debug",
        tag_string: "{date} | {greeting} | {animal} |",
        tag_string_fns: {
          date: "some_date",
          greeting: function () {
            return "hello";
          },
          animal: ANIMALS["#1235"],
        },
      });
      const expected = "some_date | hello | tiger | This is cool!";
      const actual = logger.info("This is cool!");
      Rhum.asserts.assertEquals(actual, expected);
    });
  });

  Rhum.testSuite("write()", () => {
    Rhum.testCase("logs correctly", () => {
      let logger = new Drash.CoreLoggers.ConsoleLogger({
        test: true,
        enabled: true,
      });
      const actual = logger.write(
        Drash.Dictionaries.LogLevels.get("debug")!,
        "This is cool!",
      );
      Rhum.asserts.assertEquals(actual, "This is cool!");
    });
  });
});

Rhum.run();
