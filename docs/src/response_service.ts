import Drash from "../bootstrap.ts";
import { renderFile } from "https://deno.land/x/dejs/dejs.ts";

// FILE MARKER: FUNCTIONS - EXPORTED ///////////////////////////////////////////////////////////////

export async function compile(inputFile, outputFile): Promise<any> {
  let body = await getAppDataInHtml(inputFile);
  const encoder = new TextEncoder();
  let encoded = encoder.encode(body);
  Deno.writeFileSync(outputFile, encoded);
}

export function getAppData() {
  return {
    // The below is transferred to index.ejs
    scripts: [
      "/public/assets/vendor/prismjs/prism.js",
      "/public/assets/vendor/jquery-3.3.1/jquery.min.js",
      "/public/assets/vendor/bootstrap-4.1.3-dist/js/bootstrap.min.js"
    ],
    build_timestamp: new Date().getTime(),
    conf: Drash.getEnvVar("conf").toArray().value,

    // The below is transferred to vue_app_root.vue
    app_data: JSON.stringify({
      conf: Drash.getEnvVar("conf").toArray().value,
      example_code: {
        getting_started: {
          importing_deno: code("/getting-started/importing_deno.ts"),
          quickstart: code("/getting-started/quickstart.ts")
        },
        tutorials: {
          adding_more_content_types: {
            app: code("/tutorials/adding-more-content-types/app.ts"),
            folder_structure: code(
              "/tutorials/adding-more-content-types/folder_structure.txt"
            ),
            folder_structure_setup: code(
              "/tutorials/adding-more-content-types/folder_structure_setup.sh"
            ),
            home_resource: code(
              "/tutorials/adding-more-content-types/home_resource.ts"
            ),
            response: code("/tutorials/adding-more-content-types/response.ts")
          },
          requesting_different_content_types: {
            app: code("/tutorials/requesting-different-content-types/app.ts"),
            folder_structure: code(
              "/tutorials/requesting-different-content-types/folder_structure.txt"
            ),
            folder_structure_setup: code(
              "/tutorials/requesting-different-content-types/folder_structure_setup.sh"
            ),
            response: code(
              "/tutorials/requesting-different-content-types/response.ts"
            ),
            users_resource: code(
              "/tutorials/requesting-different-content-types/users_resource.ts"
            )
          },
          logging: {
            server_logging_to_files: {
              app: code("/tutorials/logging/server-logging-to-files/app.ts"),
              folder_structure: code(
                "/tutorials/logging/server-logging-to-files/folder_structure.txt"
              ),
              folder_structure_setup: code(
                "/tutorials/logging/server-logging-to-files/folder_structure_setup.sh"
              ),
              get_request: code(
                "/tutorials/logging/server-logging-to-files/get_request.sh"
              ),
              home_resource: code(
                "/tutorials/logging/server-logging-to-files/home_resource.ts"
              ),
              server_log: code(
                "/tutorials/logging/server-logging-to-files/tmp/server.log",
                "tmp/server.log"
              )
            },
            server_logging_to_the_terminal: {
              app: code("/tutorials/logging/server-logging-to-the-terminal/app.ts"),
              folder_structure: code(
                "/tutorials/logging/server-logging-to-the-terminal/folder_structure.txt"
              ),
              folder_structure_setup: code(
                "/tutorials/logging/server-logging-to-the-terminal/folder_structure_setup.sh"
              ),
              get_request: code(
                "/tutorials/logging/server-logging-to-the-terminal/get_request.sh"
              ),
              home_resource: code(
                "/tutorials/logging/server-logging-to-the-terminal/home_resource.ts"
              ),
              terminal: code(
                "/tutorials/logging/server-logging-to-the-terminal/terminal.sh"
              )
            }
          }
        }
      }
    })
  };
}

export async function getAppDataInHtml(inputFile) {
  const output = await renderFile(inputFile, getAppData());
  let html = output.toString();
  return html;
}

// FILE MARKER: FUNCTIONS - LOCAL //////////////////////////////////////////////////////////////////

function code(file: string, filenameOverride?: string) {
  const decoder = new TextDecoder("utf-8");
  let contents = decoder.decode(Deno.readFileSync(`./src/example-code${file}`));

  let fileExtensionSplit = file.split(".");
  let fileExtension = fileExtensionSplit[fileExtensionSplit.length - 1];

  let fileSplit = file.split("/");
  let filename = fileSplit[fileSplit.length - 1];

  return {
    file: filenameOverride ? filenameOverride : filename,
    file_extension: fileExtension,
    code: contents
  };
}
