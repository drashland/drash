import Drash from "../../mod.ts";

let drashDirRoot = Drash.getEnvVar("DRASH_DIR_ROOT").value;

let compiler = new Drash.Compilers.DocBlocksToJson();
let compiled = compiler.compile([
  "/var/www/deno-drash/src/http/response.ts",
  "/var/www/deno-drash/src/http/server.ts"
]);

const encoder = new TextEncoder();
const data = encoder.encode(JSON.stringify(compiled, null, 2));
Deno.writeFileSync(`${drashDirRoot}/docs/src/api_reference.json`, data);
