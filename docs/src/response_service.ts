import Drash from "../bootstrap.ts";
import { renderFile } from 'https://deno.land/x/dejs/dejs.ts';

export function getAppData() {
  return {
    // The below is transferred to index.ejs
    scripts: [
      "/public/assets/vendor/prismjs/prism.js",
      "/public/assets/vendor/jquery-3.3.1/jquery.min.js",
      "/public/assets/vendor/bootstrap-4.1.3-dist/js/bootstrap.min.js",
    ],
    build_timestamp: (new Date()).getTime(),
    conf: Drash.getEnvVar("conf").toArray().value,

    // The below is transferred to vue_app_root.vue
    app_data: JSON.stringify({
      conf: Drash.getEnvVar("conf").toArray().value,
      example_code: {
        getting_started: {
          importing_deno: code('/getting-started/importing_deno.ts', ''),
          quickstart: code('/getting-started/quickstart.ts', 'app.ts'),
        },
        tutorials: {
          adding_more_content_types: {
            app: code("/tutorials/adding-more-content-types/app.ts", "app.ts"),
            folder_structure: code("/tutorials/adding-more-content-types/folder_structure.txt", " "),
            folder_structure_setup: code("/tutorials/adding-more-content-types/folder_structure_setup.sh"),
            home_resource: code("/tutorials/adding-more-content-types/home_resource.ts", "home_resource.ts"),
            response: code("/tutorials/adding-more-content-types/response.ts", "response.ts"),
          },
          requesting_different_content_types: {
            app: code("/tutorials/requesting-different-content-types/app.ts", "app.ts"),
            folder_structure: code("/tutorials/requesting-different-content-types/folder_structure.txt", " "),
            folder_structure_setup: code("/tutorials/requesting-different-content-types/folder_structure_setup.sh"),
            response: code("/tutorials/requesting-different-content-types/response.ts", "response.ts"),
            users_resource: code("/tutorials/requesting-different-content-types/users_resource.ts", "users_resource.ts"),
          }
        }
      }
    })
  };
}

export async function compile(inputFile, outputFile): Promise<any> {
  let body = await getAppDataInHtml(inputFile);
  const encoder = new TextEncoder();
  let encoded = encoder.encode(body);
  Deno.writeFileSync(outputFile, encoded);
}

export function code(file, filename?) {
  const decoder = new TextDecoder("utf-8");
  let contents = decoder.decode(Deno.readFileSync(`./src/example-code${file}`));
  if (!filename) {
    filename = file.split(".");
    filename = filename[filename.length - 1];
  }

  return {
    file: filename,
    code: contents
  };
}

export async function getAppDataInHtml(inputFile) {
  const output = await renderFile(inputFile, getAppData());
  let html = output.toString();
  return html;
}
