import Drash from "./bootstrap.ts";

import "./src/app_response.ts";
import AppResource from "./src/app_resource.ts";


let drashDirRoot = Drash.getEnvVar("DRASH_DIR_ROOT").value;

console.log("[docs.ts] Compiling API Reference page data using doc blocks...");
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
  `${drashDirRoot}/src/loggers/file_logger.ts`,
  `${drashDirRoot}/src/services/http_service.ts`
]);

const encoder = new TextEncoder();
const data = encoder.encode(JSON.stringify(compiled, null, 2));
const apiReferenceOutputFile = `${drashDirRoot}/docs/public/assets/json/api_reference.json`;
Deno.writeFileSync(apiReferenceOutputFile, data);
console.log(`[docs.ts] Done. API Reference page data was written to:\n    ${apiReferenceOutputFile}.`);

console.log("[docs.ts] Starting server...");
// Create and run the server
let server = new Drash.Http.Server({
  address: "localhost:8000",
  response_output: "text/html",
  logger: Drash.Vendor.ConsoleLogger,
  resources: [AppResource],
  static_paths: ["/public"]
});

server.run();
