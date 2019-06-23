import Drash from "../mod.ts";
import { writeFileSync } from "../system.ts"

// Add a global console logger because server logging when needed is cool
Drash.addMember(
  "ConsoleLogger",
  new Drash.Loggers.ConsoleLogger({
    enabled: true,
    level: "debug",
    tag_string: "{date} | {level} |",
    tag_string_fns: {
      date: function() {
        return new Date().toISOString().replace("T", " ");
      }
    }
  })
);

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
  writeFileSync(apiReferenceOutputFile, apiReferenceData);
  echo(`    Done. API Reference page data was written to: ${apiReferenceOutputFile}.`);
}

/**
 * Compile Vue global components.
 */
function compileVueGlobalComponents() {
  echo("Compiling Vue global components...");
  let files = Drash.Util.Exports.getFileSystemStructure(`${DRASH_DIR_ROOT}/docs/src/vue/components/global`);
  let importString = `import Vue from "vue";\n\n`;
  files.forEach(pathObj => {
    let componentName = pathObj.filename
      .replace(".vue", "") // take out the .vue extension
      .replace(/_/g, "-"); // change all underscores to - so that the component name is `some-name` and not `some_name`
    importString += `import ${pathObj.filename} from "${pathObj.path}";\nVue.component("${componentName}", ${pathObj.filename});\n\n`;
  });
  let outputFile = `${DRASH_DIR_ROOT}/docs/public/assets/js/compiled_vue_global_components.js`;
  writeFileSync(outputFile, Encoder.encode(importString));
  echo(`    Done. Vue global components were written to: ${outputFile}.`);
}

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
  writeFileSync(outputFile, Encoder.encode(importString));
  echo(`    Done. vue-router routes were written to: ${outputFile}.`);
}

/**
 * Run the dev server.
 */
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
