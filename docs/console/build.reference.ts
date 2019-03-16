import Drash from "../../mod.ts";

let drashDirRoot = Drash.getEnvVar("DRASH_DIR_ROOT").value;

let compiler = new Drash.Compilers.DocBlocksToJson();
let compiled = compiler.compile([
  `${drashDirRoot}/src/compilers/doc_blocks_to_json.ts`,
  `${drashDirRoot}/src/exceptions/http_exception.ts`,
  `${drashDirRoot}/src/http/request.ts`,
  `${drashDirRoot}/src/http/resource.ts`,
  `${drashDirRoot}/src/http/response.ts`,
  `${drashDirRoot}/src/http/server.ts`,
  `${drashDirRoot}/src/loggers/logger.ts`,
  `${drashDirRoot}/src/loggers/console_logger.ts`,
  `${drashDirRoot}/src/loggers/file_logger.ts`
]);

const encoder = new TextEncoder();
const data = encoder.encode(JSON.stringify(compiled, null, 2));
Deno.writeFileSync(`${drashDirRoot}/docs/src/api_reference.json`, data);
