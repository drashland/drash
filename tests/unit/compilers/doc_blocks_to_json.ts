import members from "../../members.ts";

members.test(function DocBlocksToJson_compile() {
  const decoder = new TextDecoder();
  let rawContents = Deno.readFileSync(members.Drash.getEnvVar("DRASH_DIR_ROOT").value + "/tests/data/expected_compiler_output.json");
  let expected = JSON.parse(decoder.decode(rawContents));

  let compiler = new members.Drash.Compilers.DocBlocksToJson();

  let actual = compiler.compile([
    members.Drash.getEnvVar("DRASH_DIR_ROOT").value + "/tests/data/class_1.ts",
    members.Drash.getEnvVar("DRASH_DIR_ROOT").value + "/tests/data/class_2.ts",
  ]);

  // console.log(JSON.stringify(actual, null, 2));

  members.assert.equal(expected, actual);
});
