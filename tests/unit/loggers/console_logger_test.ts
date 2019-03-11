import members from "../../members.ts";

const ANIMALS = {
  "#1235": "tiger"
};

members.test(function ConsoleLogger() {
  let expected = "some_date | hello | tiger | This is cool!";
  let logger = new members.Drash.Loggers.ConsoleLogger({
    enabled: true,
    level: "debug",
    tag_string: "{date} | {greeting} | {animal} |",
    tag_string_fns: {
      date: "some_date",
      greeting: function() {
        return "hello";
      },
      animal: ANIMALS["#1235"]
    }
  });
});
