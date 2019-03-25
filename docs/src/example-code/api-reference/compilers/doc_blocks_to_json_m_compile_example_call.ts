import Drash from "https://deno.land/x/drash/mod.ts";

const compiler = new Drash.Compilers.DocBlocksToJson();
const result = compiler.compile(["file.ts"]); // See file.ts example code below

const encoder = new TextEncoder();
const data = encoder.encode(JSON.stringify(result, null, 2));
Deno.writeFileSync("output.json", data); // See output.json example code below
