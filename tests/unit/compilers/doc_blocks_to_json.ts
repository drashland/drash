import members from "../../members.ts";

members.test(function DocBlocksToJson_compile_params() {
  const decoder = new TextDecoder();
  let rawContents = Deno.readFileSync(
    members.Drash.getEnvVar("DRASH_DIR_ROOT").value +
      "/tests/data/doc_blocks_output.json"
  );
  let expected = JSON.parse(decoder.decode(rawContents));

  let compiler = new members.Drash.Compilers.DocBlocksToJson();

  let actual = compiler.compile([
    members.Drash.getEnvVar("DRASH_DIR_ROOT").value +
      "/tests/data/doc_blocks_input.ts"
  ]);

  members.assert.equal(expected, actual);
});
