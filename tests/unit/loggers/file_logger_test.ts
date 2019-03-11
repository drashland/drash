import members from "../../members.ts";

const ANIMALS = {
  "#1235": "tiger"
};

const epoch = (new Date).getTime();
const file = Drash.getEnvVar("dir_root").value + members.conf.file_logger_test.file.replace("{time}", `${epoch}`);

members.test(function FileLogger() {
  let expected = "some_date | hello | tiger | This is cool!\n";
  let logger = new members.Drash.Loggers.FileLogger({
    enabled: members.CONF.file_logger_test.enabled,
    level: "debug",
    tag_string: "{date} | {greeting} | {animal} |",
    tag_string_fns: {
      date: "some_date",
      greeting: function() {
        return "hello";
      },
      animal: ANIMALS["#1235"]
    },
    file: file
  });
  logger.info("This is cool!");
  const decoder = new TextDecoder();
  let actual = decoder.decode(Deno.readFileSync(file));
  members.assert.equal(actual, expected);
});
