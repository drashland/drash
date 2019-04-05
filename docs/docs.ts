import Drash from "./bootstrap.ts";

const Decoder = new TextDecoder();
const Encoder = new TextEncoder();
const DRASH_DIR_ROOT = Drash.getEnvVar("DRASH_DIR_ROOT").value;


import AppResponse from "./src/app_response.ts";
Drash.Http.Response = AppResponse;
import AppResource from "./src/app_resource.ts";

compileApiReferencePageData();
compileVueRouterRoutes();
runServer();

// FILE MARKER: FUNCTIONS //////////////////////////////////////////////////////

function compileApiReferencePageData() {
  let DrashNamespaceMembers = [
    // `/src/compilers/doc_blocks_to_json.ts`,
    // `/src/exceptions/http_exception.ts`,
    // `/src/http/request.ts`,
    // `/src/http/resource.ts`,
    // `/src/http/response.ts`,
    // `/src/http/server.ts`,
    // `/src/loggers/logger.ts`,
    // `/src/loggers/console_logger.ts`,
    // `/src/loggers/file_logger.ts`,
    // `/src/services/http_service.ts`,
    // `/src/util/object_parser.ts`,
    `/src/util/members.ts`
  ].map(value => {
    return DRASH_DIR_ROOT + value;
  });
  console.log("[docs.ts] Compiling API Reference page data using doc blocks...");
  let compiler = new Drash.Compilers.DocBlocksToJson();
  let compiled = compiler.compile(DrashNamespaceMembers);
  let apiReferenceData = Encoder.encode(JSON.stringify(compiled, null, 4));
  const apiReferenceOutputFile = `${DRASH_DIR_ROOT}/docs/public/assets/json/api_reference.json`;
  Deno.writeFileSync(apiReferenceOutputFile, apiReferenceData);
  console.log(`[docs.ts] Done. API Reference page data was written to:\n    ${apiReferenceOutputFile}.`);
}

function compileVueRouterRoutes() {
  console.log("[docs.ts] Compiling vue-router routes...");
  let vueRouterComponentPaths = [];
  let vueRouterComponents = Deno.readDirSync(`${DRASH_DIR_ROOT}/docs/src/vue/components/pages`);
  function iterateDirectoryFiles(store, files) {
    files.forEach(file => {
      if (file.isFile()) {
        store.push({
          name: file.name.replace(".", "_"),
          path: file.path
        });
      } else {
        iterateDirectoryFiles(store, Deno.readDirSync(file.path));
      }
    });
  }
  iterateDirectoryFiles(vueRouterComponentPaths, vueRouterComponents);
  let importString = "";
  vueRouterComponentPaths.forEach(pathObj => {
    importString += `import * as ${pathObj.name} from "${pathObj.path}";\n`;
  });
  importString += "\nexport default [\n";
  vueRouterComponentPaths.forEach(pathObj => {
    importString += `  ${pathObj.name},\n`;
  });
  importString += "];";
  let outputFile = `${DRASH_DIR_ROOT}/docs/public/assets/js/compiled_routes.js`;
  Deno.writeFileSync(outputFile, Encoder.encode(importString));
  console.log(`[docs.ts] Done. vue-router routes were written to:\n    ${outputFile}.`);
}

function runServer() {
  console.log("[docs.ts] Starting server...");
  let server = new Drash.Http.Server({
    address: "localhost:8000",
    response_output: "text/html",
    logger: Drash.Members.ConsoleLogger,
    resources: [AppResource],
    static_paths: ["/public"]
  })
  server.run();
}
