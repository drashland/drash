import members from "../../members.ts";

const ANIMALS = {
  "#1235": "tiger",
};

members.test("console_logger_test.ts | ConsoleLogger", () => {
  let expected = "some_date | hello | tiger | This is cool!";
  let logger = new members.Drash.CoreLoggers.ConsoleLogger({
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
  let actual = logger.info("This is cool!");
  members.assert.equal(actual, expected);
});
