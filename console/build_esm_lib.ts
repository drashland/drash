import { copySync, emptyDirSync, ensureDirSync, walk } from "./deps.ts";
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const workspace = "./tmp/conversion_workspace";

const buildFor = Deno.args[0];

const debug = false;

function logDebug(msg: unknown): void {
  if (!debug) {
    return;
  }

  console.log(msg);
}

const filesToCopy = [
  {
    src: "./src/core/handlers/abstract",
    dest: "/src/core/handlers/abstract",
  },
  {
    src: "./src/core/handlers/abstract",
    dest: "/src/core/handlers/abstract"
  },
  {
    src: "./src/core/handlers/error_handler.ts",
    dest: "/src/core/handlers/error_handler.ts"
  },
  {
    src: "./src/core/handlers/services_handler.ts",
    dest: "/src/core/handlers/services_handler.ts"
  },
  {
    src: "./src/core/http/abstract",
    dest: "/src/core/http/abstract"
  },
  {
    src: "./src/core/http/errors.ts",
    dest: "/src/core/http/errors.ts"
  },
  {
    src: "./src/core/http/status_code_registry.ts",
    dest: "/src/core/http/status_code_registry.ts"
  },
  {
    src: "./src/core/proxies/error_handler_proxy.ts",
    dest: "/src/core/proxies/error_handler_proxy.ts"
  },
  {
    src: "./src/core/enums.ts",
    dest: "/src/core/enums.ts"
  },
  {
    src: "./src/core/interfaces.ts",
    dest: "/src/core/interfaces.ts"
  },
  {
    src: "./src/core/types.ts",
    dest: "/src/core/types.ts"
  },
  {
    src: "./src/node",
    dest: "/src/node"
  },
  {
    src: "./mod.node.ts",
    dest: "/mod.ts"
  },
]

try {
  logDebug(`Creating ${workspace}.`);
  emptyDirSync(workspace);
  ensureDirSync(workspace);
  ensureDirSync(workspace + "/src/core/handlers")
  ensureDirSync(workspace + "/src/core/http")
  ensureDirSync(workspace + "/src/core/proxies")
  logDebug(`Copying Drash source files to ${workspace}.`);
  for (const file of filesToCopy) {
    copySync(file.src, workspace + file.dest, { overwrite: true });
  }
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
    return statement.replace(/\.ts";/, `.js";`);
  });

  const newExportStatements = exportStatements?.map((statement: string) => {
    return statement.replace(/\.ts";/, `.js";`);
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

