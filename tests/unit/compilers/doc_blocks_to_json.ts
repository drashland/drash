import members from "../../members.ts";

// members.test(function DocBlocksToJson_compile() {
//   const decoder = new TextDecoder();
//   let rawContents = Deno.readFileSync(members.Drash.getEnvVar("DRASH_DIR_ROOT").value + "/tests/data/expected_compiler_output.json");
//   let expected = JSON.parse(decoder.decode(rawContents));

//   let compiler = new members.Drash.Compilers.DocBlocksToJson();

//   let actual = compiler.compile([
//     members.Drash.getEnvVar("DRASH_DIR_ROOT").value + "/tests/data/class_1.ts",
//     members.Drash.getEnvVar("DRASH_DIR_ROOT").value + "/tests/data/class_2.ts",
//   ]);

//   members.assert.equal(expected, actual);
// });

members.test(function DocBlocksToJson_compile_params() {
  const decoder = new TextDecoder();
  let rawContents = Deno.readFileSync(members.Drash.getEnvVar("DRASH_DIR_ROOT").value + "/tests/data/expected_compiler_output_params.json");
  let expected = JSON.parse(decoder.decode(rawContents));

  let compiler = new members.Drash.Compilers.DocBlocksToJson();

  let actual = compiler.compile([
    members.Drash.getEnvVar("DRASH_DIR_ROOT").value + "/tests/data/class_params.ts",
  ]);

  members.assert.equal(expected, actual);
});
