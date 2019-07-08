import members from "../../members.ts";
import { IO, Decoder } from "../../../system.ts";

const ANIMALS = {
  "#1235": "tiger"
};

const file =
  members.Drash.getEnvVar("DRASH_DIR_ROOT").value + `/tmp/file_logger_test.log`;

members.test(function FileLogger() {
  let expected = "some_date | hello | tiger | This is cool!\n";
  let logger = new members.Drash.Loggers.FileLogger({
    enabled: true,
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
  const decoder = new Decoder();
  let actual = decoder.decode(IO.readFileSync(file));
  members.assert.equal(actual, expected);
  IO.removeSync(file, { recursive: false });
});
