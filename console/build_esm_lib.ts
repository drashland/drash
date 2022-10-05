import { copySync, emptyDirSync, ensureDirSync, walk } from "./deps.ts";
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const workspace = "./tmp/conversion_workspace";

const debug = true;

function logDebug(msg: unknown): void {
  if (!debug) {
    return;
  }

  console.log(msg);
}

try {
  logDebug(`Creating ${workspace}.`);
  emptyDirSync(workspace);
  ensureDirSync(workspace);
  ensureDirSync(workspace + "/src/core/handlers")
  ensureDirSync(workspace + "/src/core/http")
  ensureDirSync(workspace + "/src/core/proxies")
  logDebug(`Copying Drash source files to ${workspace}.`);
  // Copy core because the Node lib relies on core code
  copySync("./src/core/handlers/abstract", workspace + "/src/core/handlers/abstract", { overwrite: true });
  copySync("./src/core/handlers/error_handler.ts", workspace + "/src/core/handlers/error_handler.ts", { overwrite: true });
  copySync("./src/core/handlers/services_handler.ts", workspace + "/src/core/handlers/services_handler.ts", { overwrite: true });
  copySync("./src/core/http/abstract", workspace + "/src/core/http/abstract", { overwrite: true });
  copySync("./src/core/http/errors.ts", workspace + "/src/core/http/errors.ts", { overwrite: true });
  copySync("./src/core/http/status_code_registry.ts", workspace + "/src/core/http/status_code_registry.ts", { overwrite: true });
  copySync("./src/core/proxies/error_handler_proxy.ts", workspace + "/src/core/proxies/error_handler_proxy.ts", { overwrite: true });
  copySync("./src/core/enums.ts", workspace + "/src/core/enums.ts", { overwrite: true });
  copySync("./src/core/interfaces.ts", workspace + "/src/core/interfaces.ts", { overwrite: true });
  copySync("./src/core/types.ts", workspace + "/src/core/types.ts", { overwrite: true });
  copySync("./src/node", workspace + "/src/node", { overwrite: true });
  // copySync("./services/native", workspace + "/services/native", { overwrite: true });
  copySync("./mod.node.ts", workspace + "/mod.ts", { overwrite: true });
} catch (error) {
  logDebug(error);
  Deno.exit(1);
}

logDebug("Starting .ts extension removal process.");

for await (const entry of walk(workspace)) {
  if (!entry.isFile) {
    continue;
  }

  logDebug(`Removing .ts extensions from ${entry.path}.`);
  removeTsExtensions(entry.path);
  logDebug("Moving to next file.\n\n");
}

logDebug("Done removing .ts extensions from source files.");

/**
 * Remove the .ts extensions for runtimes that do not require it.
 */
function removeTsExtensions(filename: string): void {
  // Step 1: Read contents
  let contents = decoder.decode(Deno.readFileSync(filename));

  // Step 2: Create an array of import/export statements from the contents
  const importStatements = contents.match(
    /(import.+\.ts";)|(import.+((\n|\r)\s.+)+(\n|\r).+\.ts";)/g,
  );
  const exportStatements = contents.match(
    /(export.+\.ts";)|(export.+((\n|\r)\s.+)+(\n|\r).+\.ts";)/g,
  );

  // Step 3: Remove all .ts extensions from the import/export statements
  const newImportStatements = importStatements?.map((statement: string) => {
    return statement.replace(/\.ts";/, `";`);
  });

  const newExportStatements = exportStatements?.map((statement: string) => {
    return statement.replace(/\.ts";/, `";`);
  });

  // Step 4: Replace the original contents with the new contents
  if (newImportStatements) {
    importStatements?.forEach((statement: string, index: number) => {
      contents = contents.replace(statement, newImportStatements[index]);
    });
  }
  if (newExportStatements) {
    exportStatements?.forEach((statement: string, index: number) => {
      contents = contents.replace(statement, newExportStatements[index]);
    });
  }

  logDebug(`New contents (without .ts extensions):`);
  logDebug(contents);

  // Step 5: Rewrite the original file without .ts extensions
  logDebug(`Overwriting ${filename} with new contents.`);
  Deno.writeFileSync(filename, encoder.encode(contents));
  logDebug("File written.");
}
