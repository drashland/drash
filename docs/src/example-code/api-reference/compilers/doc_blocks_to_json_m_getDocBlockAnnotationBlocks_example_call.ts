import Drash from "https://deno.land/x/drash/mod.ts";

const decoder = new TextDecoder();
const fileContentsRaw = Deno.readFileSync("doc_block.txt");  // See doc_block.txt example code below
const docBlock = decoder.decode(fileContentsRaw);

const compiler = new Drash.Compilers.DocBlocksToJson();
const results = {
  params: compiler.getDocBlockAnnotationBlocks("@param", docBlock);
  returns: compiler.getDocBlockAnnotationBlocks("@returns", docBlock);
  throws: compiler.getDocBlockAnnotationBlocks("@throws", docBlock);
};

const encoder = new TextEncoder();
const data = encoder.encode(JSON.stringify(results, null, 2));
Deno.writeFileSync("output.json", data); // See output.json example code below
