import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

const ANIMALS = {
  "#1235": "tiger",
};

members.testSuite("loggers/console_logger.ts", () => {

  members.test("ConsoleLogger", () => {
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
    members.assertEquals(actual, expected);
  });

});
