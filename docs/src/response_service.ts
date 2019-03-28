import Drash from "../bootstrap.ts";
import { renderFile } from "https://deno.land/x/dejs/dejs.ts";
import compiledExampleCodeJson from "./../public/assets/json/compiled_example_code.json";
const decoder = new TextDecoder();

// FILE MARKER: FUNCTIONS - EXPORTED ///////////////////////////////////////////

export async function compile(inputFile, outputFile): Promise<any> {
  let body = await getAppDataInHtml(inputFile);
  const encoder = new TextEncoder();
  let encoded = encoder.encode(body);
  Deno.writeFileSync(outputFile, encoded);
}

export function getAppData() {
  const buildTimestamp = new Date().getTime();
  return {
    // The below is transferred to index.ejs
    scripts: {
      local: [
        "/public/assets/vendor/prismjs/prism.js",
        "/public/assets/vendor/jquery-3.3.1/jquery.min.js",
        "/public/assets/vendor/bootstrap-4.1.3-dist/js/bootstrap.min.js",
        `/public/assets/js/bundle.js?version=${buildTimestamp}`
      ],
      external: [
        "https://unpkg.com/axios/dist/axios.min.js",
      ]
    },
    conf: {
      base_url: Deno.env().DRASH_DOCS_BASE_URL
        ? Deno.env().DRASH_DOCS_BASE_URL
        : ""
    },

    // The below is transferred to vue_app_root.vue
    app_data: JSON.stringify({
      example_code: compiledExampleCodeJson.example_code,
      store: {
        page_data: {
          api_reference: getPageDataApiReference()
        }
      }
    }) // close app_data
  };
}

export async function getAppDataInHtml(inputFile) {
  const output = await renderFile(inputFile, getAppData());
  let html = output.toString();
  return html;
}

// FILE MARKER: FUNCTIONS - LOCAL //////////////////////////////////////////////

function getPageDataApiReference() {
  let contents = "";
  try {
    contents = decoder.decode(Deno.readFileSync(`./public/assets/json/api_reference.json`));
  } catch (error) {
    Drash.core_logger.error(error);
  }

  return JSON.parse(contents);
}
