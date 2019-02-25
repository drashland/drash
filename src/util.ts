export class FileCreator {
  static httpResources(pathToResources: string) {
    let filename = `${pathToResources}/.drash_http_resources.ts`;
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
    console.log(`\nWriting HTTP resources file "${filename}" with the following content:`);
    console.log(imports + exports);
    Deno.writeFileSync(filename, data);
    console.log(`\nFile ${filename} created!`);
    console.log(`\nMake sure to add the following to your project:\n    import resources from "${filename}";`);
  }
}
