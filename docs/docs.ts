import Drash from "./bootstrap.ts";

const Decoder = new TextDecoder();
const Encoder = new TextEncoder();
const DRASH_DIR_ROOT = Drash.getEnvVar("DRASH_DIR_ROOT").value;


import AppResponse from "./src/app_response.ts";
Drash.Http.Response = AppResponse;
import AppResource from "./src/app_resource.ts";

compileApiReferencePageData();
// compileVueGlobalComponents();
compileVueRouterRoutes();
runServer();

// FILE MARKER: FUNCTIONS //////////////////////////////////////////////////////

/**
 * Log a message to the console.
 *
 * @param string message
 */
function echo(message) {
  console.log(`[docs.ts] ${message}`);
}

/**
 * Compile the API Reference page's data.
 */
function compileApiReferencePageData() {
  let DrashNamespaceMembers = [
    `/src/compilers/doc_blocks_to_json.ts`,
    `/src/dictionaries/log_levels.ts`,
    `/src/exceptions/http_exception.ts`,
    `/src/http/request.ts`,
    `/src/http/resource.ts`,
    `/src/http/response.ts`,
    `/src/http/server.ts`,
    `/src/loggers/logger.ts`,
    `/src/loggers/console_logger.ts`,
    `/src/loggers/file_logger.ts`,
    `/src/services/http_service.ts`,
    `/src/util/object_parser.ts`,
    `/src/util/members.ts`
  ].map(value => {
    return DRASH_DIR_ROOT + value;
  });
  echo("Compiling API Reference page data using doc blocks...");
  let compiler = new Drash.Compilers.DocBlocksToJson();
  let compiled = compiler.compile(DrashNamespaceMembers);
  let apiReferenceData = Encoder.encode(JSON.stringify(compiled, null, 4));
  const apiReferenceOutputFile = `${DRASH_DIR_ROOT}/docs/public/assets/json/api_reference.json`;
  Deno.writeFileSync(apiReferenceOutputFile, apiReferenceData);
  echo(`    Done. API Reference page data was written to: ${apiReferenceOutputFile}.`);
}

/**
 * Compile Vue global components.
 */
// function compileVueGlobalComponents() {
//   echo("Compiling Vue global components...");
//   let vueRouterComponentPaths = [];
//   let vueRouterComponentsDir = `${DRASH_DIR_ROOT}/docs/src/vue/components/global`;
//   iterateDirectoryFilesForVueGlobalComponents(vueRouterComponentPaths, Deno.readDirSync(vueRouterComponentsDir));
//   let importString = `import Vue from "vue";\n\n`;
//   vueRouterComponentPaths.forEach(pathObj => {
//     let componentName = pathObj.name.replace("_vue", "").replace(/_/g, "-");
//     importString += `import ${pathObj.name} from "${pathObj.path}";\nVue.component("${componentName}", ${pathObj.name});\n\n`;
//   });
//   let outputFile = `${DRASH_DIR_ROOT}/docs/public/assets/js/compiled_vue_global_components.js`;
//   Deno.writeFileSync(outputFile, Encoder.encode(importString));
//   echo(`    Done. Vue global components were written to: ${outputFile}.`);
// }

/**
 * Compile vue-router routes.
 */
function compileVueRouterRoutes() {
  echo("Compiling vue-router routes...");
  let files = Drash.Util.Exports.getFileSystemStructure(`${DRASH_DIR_ROOT}/docs/src/vue/components/pages`);
  let importString = "";
  files.forEach(pathObj => {
    importString += `import * as ${pathObj.snake_cased} from "${pathObj.path}";\n`;
  });
  importString += "\nexport default [\n";
  files.forEach(pathObj => {
    importString += `  ${pathObj.snake_cased},\n`;
  });
  importString += "];";
  let outputFile = `${DRASH_DIR_ROOT}/docs/public/assets/js/compiled_routes.js`;
  Deno.writeFileSync(outputFile, Encoder.encode(importString));
  console.log(importString);
  echo(`    Done. vue-router routes were written to: ${outputFile}.`);
}

// function iterateDirectoryFilesForVueGlobalComponents(store, files) {
//   files.forEach(file => {
//     if (file.isFile()) {
//       store.push({
//         name: file.name.replace(".", "_"), // change name from filename.vue to filename_vue
//         path: `${vueRouterComponentsDir}/${file.name}`
//       });
//     } else {
//       iterateDirectoryFiles(store, Deno.readDirSync(`${vueRouterComponentsDir}/${file.name}`));
//     }
//   });
// }

function runServer() {
  echo("Starting server...");
  let server = new Drash.Http.Server({
    address: "localhost:8000",
    response_output: "text/html",
    logger: Drash.Members.ConsoleLogger,
    resources: [AppResource],
    static_paths: ["/public"]
  })
  server.run();
}
