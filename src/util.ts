export class FileCreator {
  static CONFIG = {
    log_enabled: false
  };

  static log = function(message) {
    if (FileCreator.CONFIG.log_enabled) {
      console.log(message);
    }
  };

  static httpResources(pathToResources: string, saveFileAs?: string) {
    let filename = `${pathToResources}/.drash_http_resources.ts`;
    if (saveFileAs) {
      filename = saveFileAs;
    }
    const resources = Deno.readDirSync(pathToResources);

    let imports = "";
    let exports = "";

    for (let key in resources) {
      let resource = resources[key];
      let name = resource.name.split(".")[0];

      const decoder = new TextDecoder("utf-8");
      let file = decoder.decode(Deno.readFileSync(resource.path));
      // Don't include any resources that don't have paths because Drash.Http.Server won't like that
      if (file.includes("static paths")) {
        imports += `import ${name} from "${resource.path}";\n`;
        exports += `  ${name},\n`;
      }
    }

    exports = `export default [\n${exports}]\n`;

    const encoder = new TextEncoder();
    const data = encoder.encode(imports + exports);
    FileCreator.log(
      `\nWriting HTTP resources file "${filename}" with the following content:`
    );
    FileCreator.log(imports + exports);
    Deno.writeFileSync(filename, data);
    FileCreator.log(`\nFile ${filename} created!`);
    FileCreator.log(
      `\nMake sure to add the following to your project:\n    import resources from "${filename}";`
    );
  }
}
