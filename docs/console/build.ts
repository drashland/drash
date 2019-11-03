import Drash from "../../mod.ts";
import * as ResponseService from "../src/response_service.ts";

const Decoder = new TextDecoder();
const Encoder = new TextEncoder();

ResponseService.compile(
  `${Deno.env().DRASH_DIR_ROOT}/docs/src/templates/index.ejs`,
  `${Deno.env().DRASH_DIR_ROOT}/docs/index.html`
);

compileApiReferencePageData();
compileVueGlobalComponents();
compileVueRouterRoutes();

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
    return Deno.env().DRASH_DIR_ROOT + value;
  });
  echo("Compiling API Reference page data using doc blocks...");
  let compiler = new Drash.Compilers.DocBlocksToJson();
  let compiled = compiler.compile(DrashNamespaceMembers);
  let apiReferenceData = Encoder.encode(JSON.stringify(compiled, null, 4));
  const apiReferenceOutputFile = `${Deno.env().DRASH_DIR_ROOT}/docs/public/assets/json/api_reference.json`;
  Deno.writeFileSync(apiReferenceOutputFile, apiReferenceData);
  echo(`    Done. API Reference page data was written to: ${apiReferenceOutputFile}.`);
}

/**
 * Compile Vue global components.
 */
function compileVueGlobalComponents() {
  echo("Compiling Vue global components...");
  let files = Drash.Util.Exports.getFileSystemStructure(`${Deno.env().DRASH_DIR_ROOT}/docs/src/vue/components/global`);
  let importString = 'import Vue from \"vue\";\n\n';
  files.forEach(pathObj => {
    if (pathObj.isDirectory()) {
      return;
    }
    let snakeCasedNoExtension = pathObj.filename
      .replace(".vue", "") // take out the .vue extension
      .replace(/_/g, "-"); // change all underscores to - so that the component name is `some-name` and not `some_name`
    importString += 'import ' + pathObj.snake_cased + ' from \"' + pathObj.path + '\";\nVue.component(\"' + snakeCasedNoExtension + '\", ' + pathObj.snake_cased + ');\n\n';
  });
  let outputFile = `${Deno.env().DRASH_DIR_ROOT}/docs/public/assets/js/compiled_vue_global_components.js`;
  Deno.writeFileSync(outputFile, Encoder.encode(importString));
  echo(`    Done. Vue global components were written to: ${outputFile}.`);
}

/**
 * Compile vue-router routes.
 */
function compileVueRouterRoutes() {
  echo("Compiling vue-router routes...");
  let files = Drash.Util.Exports.getFileSystemStructure(`${Deno.env().DRASH_DIR_ROOT}/docs/src/vue/components/pages`);
  let importString = "";
  files.forEach(pathObj => {
    if (pathObj.isDirectory()) {
      return;
    }
    importString += 'import * as ' + pathObj.snake_cased + ' from \"' + pathObj.path + '\";\n';
  });
  importString += "\nexport default [\n";
  files.forEach(pathObj => {
    if (pathObj.isDirectory()) {
      return;
    }
    importString += `  ${pathObj.snake_cased},\n`;
  });
  importString += "];";
  let outputFile = `${Deno.env().DRASH_DIR_ROOT}/docs/public/assets/js/compiled_routes.js`;
  Deno.writeFileSync(outputFile, Encoder.encode(importString));
  echo(`    Done. vue-router routes were written to: ${outputFile}.`);
}
