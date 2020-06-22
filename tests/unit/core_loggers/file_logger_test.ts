import members from "../../members.ts";
import { Drash } from "../../../mod.ts";

const ANIMALS = {
  "#1235": "tiger",
};

const file = "./tmp/file_logger_test.log";

members.testSuite("core_loggers/file_logger.ts", () => {
  members.test(`writes file: ${file}`, () => {
    let expected = "some_date | hello | tiger | This is cool!\n";
    let logger = new Drash.CoreLoggers.FileLogger({
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
      file: file,
    });
    logger.info("This is cool!");
    const decoder = new TextDecoder();
    let actual = decoder.decode(Deno.readFileSync(file));
    members.assertEquals(actual, expected);
    Deno.removeSync(file, { recursive: false });
  });
});
