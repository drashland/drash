// namespace Drash.Compilers

export default class DocBlocksToJson {

  protected decoder: TextDecoder;
  protected namespace_tag = "// namespace";
  protected parsed = {};

  // FILE MARKER: PUBLIC ///////////////////////////////////////////////////////

  /**
   * Compile a JSON string containing classes, properties, and methods in the
   * Drash namespace.
   *
   * @param string[] files
   *     The array of files containing doc blocks to parse.
   *
   * @return any
   *     Returns the JSON array.
   */
  public compile(files: string[]): any {
    this.decoder = new TextDecoder();

    files.forEach((file) => {
      let fileContentsRaw = Deno.readFileSync(file);
      let fileContents = this.decoder.decode(fileContentsRaw);
      let contentsByLine = fileContents.toString().split("\n");

      // No namespace given? GTFO.
      if (contentsByLine[0].indexOf(this.namespace_tag)) {
        return;
      }

      // Create the namespace
      // Take the `// namespace Some.Namespace` and transform it into
      // `Some.Namespace`
      let currentNamespace = contentsByLine[0].substring(this.namespace_tag.length).trim();

      // Create the namespace in the `parsed` property so we can start storing
      // the namespace's members in it
      if (!this.parsed.hasOwnProperty(currentNamespace)) {
        this.parsed[currentNamespace] = {};
      }

      // Get the class name of the current file being parsed. There should only
      // be one `@class` tag in the file. If there are more than one `@class`
      // tag, then the first one will be chosen. The others won't matter. Sorry.
      let className = fileContents.match(/@class \w+/)[0].substring("@class".length).trim();

      let methodDocBlocks = fileContents.match(/\/\*\*((\s).+)+\*\/+\s.+\(*\)/g);

      let methods = this.parseDocBlocksForMethods(methodDocBlocks);

      this.parsed[currentNamespace][className] = {
        // properties: this.parseDocBlocksForProperties(fileContents),
        methods: methods,
      };
    });

    return this.parsed;
  }

  // FILE MARKER: PROTECTED ////////////////////////////////////////////////////

  /**
   * Parse the specified array of method doc blocks.
   */
  protected parseDocBlocksForMethods(docBlocks: string[]) {
    let methods = [];

    let reIsClassDefinition = new RegExp('(export default).+class.+{?', "g");

    docBlocks.forEach((docBlock) => {
      if (reIsClassDefinition.test(docBlock)) {
        return;
      }

      let docBlockLinesAsArray = docBlock.split("\n");
      let signature = docBlockLinesAsArray[docBlockLinesAsArray.length - 1].trim();

      methods.push({
        signature: signature,
        access_modifier: signature.split(" ")[0],
        name: signature.split(" ")[1].split("(")[0], // This could use some work
        params: this.getDocBlockParams(docBlock),
        description: this.getDocBlockDescription(docBlock)
      });
    });

    return methods;
  }

  protected getDocBlockDescription(docBlock) {
    let docBlocksByLine = docBlock.split("\n");
    let paragraphs = [];
    let endOfDescription = false;

    let reAnnotationTag = new RegExp(/@(param|examplecode|return|throws|property)/, "g");

    docBlocksByLine.forEach((line) => {
      if (endOfDescription) {
        return;
      }

      if (line.trim() == "/**") {
        return;
      }

      if (reAnnotationTag.test(line)) {
        endOfDescription = true;
        return;
      }

      paragraphs.push(line);
    });

    paragraphs = this.splitParagraph(paragraphs);
    paragraphs = this.getParagraphs(paragraphs);

    return paragraphs;
  }

  /**
   * Get the `@param` definitions from the doc block.
   *
   * @param string docBlock
   *     The docBlock to get the `@param` definitions from.
   *
   * @return any
   */
  protected getDocBlockParams(docBlock) {
    let reParams = new RegExp(/@param.+((\s.*).+     .*)*(\s*\*\s+)*(\w).*/, "g");
    let params = docBlock.match(reParams);

    if (params) {
      params = params.map((val) => {
        // Clean up each line and return an overall clean description
        let split = val.split("\n");
        split = this.splitParagraph(split);
        let annotation = split.shift();
        let description = this.getParagraphs(split);

        return {
          annotation: annotation,
          data_type: annotation.split(" ")[1],
          name: annotation.split(" ")[2],
          description: description
        };
      });
    }

    return params;
  }

  protected splitParagraph(array) {
    return array.map((line) => {
      if (line.trim() === "*") {
        return "---para-break---"
      }
      // A new paragraph is preceded by a "*" and it won't be replaced. We
      // can use this fact to separate paragraphs.
      return line.replace(" * ", "").trim();
    });
  }

  protected getParagraphs(array) {
    array = array.join(" ").split("---para-break---").map((val) => {
      return val.trim();
    });
    if (array[array.length - 1] == "") {
      array.pop();
    }

    return array;
  }
}
