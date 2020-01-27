import members from "../../members.ts";

members.test("-", () => {
  console.log("file_logger.ts");
});

const ANIMALS = {
  "#1235": "tiger"
};

const file = `${Deno.env().DRASH_ROOT_DIR}/tmp/file_logger_test.log`;
members.test(`FileLogger (${file})`, () => {
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
  const decoder = new TextDecoder();
  let actual = decoder.decode(Deno.readFileSync(file));
  members.assert.equal(actual, expected);
  Deno.removeSync(file, { recursive: false });
});
