import Drash from "../../mod.ts";
import { renderFile } from "https://deno.land/x/dejs/dejs.ts";
const Decoder = new TextDecoder();
const Encoder = new TextEncoder();

// FILE MARKER: FUNCTIONS - EXPORTED ///////////////////////////////////////////

export async function compile(inputFile, outputFile): Promise<any> {
  let body = await getAppDataInHtml(inputFile);
  let encoded = Encoder.encode(body);
  Deno.writeFileSync(outputFile, encoded);
}

export function getAppData() {
  const buildTimestamp = new Date().getTime();
  const env =
    Deno.env().DRASH_DOCS_BASE_URL == "/deno-drash"
      ? "production"
      : "development";
  let bundleVersion = "";
  if (env == "production") {
    bundleVersion = ".min";
  }

  return {
    // The below is transferred to index.ejs
    scripts: {
      local: [
        "/public/assets/vendor/prismjs/prism.js",
        "/public/assets/vendor/jquery-3.3.1/jquery.min.js",
        "/public/assets/vendor/bootstrap-4.1.3-dist/js/bootstrap.min.js",
        `/public/assets/js/bundle${bundleVersion}.js?version=${buildTimestamp}`
      ],
      external: ["https://unpkg.com/axios/dist/axios.min.js"]
    },
    conf: {
      base_url: Deno.env().DRASH_DOCS_BASE_URL
        ? Deno.env().DRASH_DOCS_BASE_URL
        : ""
    },

    // The below is transferred to vue_app_root.vue
    app_data: JSON.stringify({
      // example_code: getExampleCode().example_code,
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
    contents = Decoder.decode(
      Deno.readFileSync(`./public/assets/json/api_reference.json`)
    );
  } catch (error) {
    Drash.core_logger.error(error);
  }

  return JSON.parse(contents);
}

function getExampleCode() {
  let languages = {
    sh: "shell",
    ts: "typescript",
    css: "css",
    js: "javascript"
  };

  let store = {};

  let ignore = ["api_reference", ".DS_Store"];

  let files = Drash.Util.Exports.getFileSystemStructure("/src/example_code");

  function getTitle(file, fileExtension) {
    let title =
      fileExtension == "sh" ? "Terminal" : `/path/to/your/project/${file.name}`;

    title =
      file.name == "folder_structure.txt" ? "Project Folder Structure" : title;

    return title;
  }

  files.forEach(file => {
    let fileNamespace;
    try {
      let fileNamespaceSplit = file.path.split("/");
      fileNamespace = fileNamespaceSplit[fileNamespaceSplit.length - 1];
    } catch (error) {}

    if (!store[fileNamespace]) {
      store[fileNamespace] = {};
    }

    if (ignore.indexOf(file.filename) != -1) {
      return;
    }

    let fileContentsRaw = Deno.readFileSync(file.path);
    let fileContents = Decoder.decode(fileContentsRaw);
    fileContents = fileContents.replace(/<\/script>/g, "<//script>");
    let filename;

    let fileExtensionSplit = filename.split(".");
    let fileExtension = fileExtensionSplit[fileExtensionSplit.length - 1];

    store[fileNamespace][filename] = {
      contents: fileContents,
      extension: fileExtension,
      title: getTitle(file, fileExtension),
      name: filename,
      language: languages[fileExtension]
    };
  });
  // We get example_code because that's the name of the first directory being
  // passed to iterateDirectoryFiles()
  return store;
}
