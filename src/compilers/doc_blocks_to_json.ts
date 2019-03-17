// namespace Drash.Compilers

/**
 * @class DocBlocksToJson
 * This compiler reads doc blocks and converts them to parsable JSON.
 */
export default class DocBlocksToJson {

  protected decoder: TextDecoder;
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
      let reNamespace = new RegExp(/\/\/ namespace .+/, "g");
      if (!reNamespace.test(fileContents)) {
        return;
      }

      // Create the namespace
      // Take the `// namespace Some.Namespace` and transform it into
      // `Some.Namespace`
      let currentNamespace = fileContents.match(reNamespace)[0].split(" ").pop();

      // Create the namespace in the `parsed` property so we can start storing
      // the namespace's members in it
      if (!this.parsed.hasOwnProperty(currentNamespace)) {
        this.parsed[currentNamespace] = {};
      }

      // Get the class name of the current file being parsed. There should only
      // be one `@class` tag in the file. If there are more than one `@class`
      // tag, then the first one will be chosen. The others won't matter. Sorry.
      let className = fileContents.match(/@class \w+/)[0].substring("@class".length).trim();

      let methodDocBlocks = fileContents.match(/\/\*\*((\s)+\*.*)*\s.*\).*{/g);
      let propertyDocBlocks = fileContents.match(/\/\*\*((\s)+\*.*)*\s.*[:|=].+;/g);

      this.parsed[currentNamespace][className] = {
        properties: this.getClassProperties(propertyDocBlocks),
        methods: this.getClassMethods(methodDocBlocks),
      };
    });

    return this.parsed;
  }

  // FILE MARKER: PROTECTED ////////////////////////////////////////////////////

  /**
   * Parse the specified array of method doc blocks and return an array of
   * method-related data.
   *
   * @param string[] docBlocks
   */
  protected getClassMethods(docBlocks: string[]): any {
    let methods = [];

    if (!docBlocks || docBlocks.length == 0) {
      return methods;
    }

    docBlocks.forEach((docBlock) => {
      let docBlockLinesAsArray = docBlock.split("\n");
      let signature = docBlockLinesAsArray[docBlockLinesAsArray.length - 1].trim();
      signature = signature.replace(/ ?{/g, "");
      let accessModifier = /constructor/.test(signature)
        ? "public"
        : signature.split(" ")[0];
      // TODO(crookse) This could use some work
      let name = accessModifier == "constructor"
        ? accessModifier
        : signature.split(" ")[1].split("(")[0];

      methods.push({
        access_modifier: accessModifier,
        description: this.getDocBlockDescription(docBlock),
        example_code: this.getDocBlockExampleCode(docBlock),
        name: name,
        params: this.getDocBlockAnnotationBlocks("@param", docBlock),
        returns: this.getDocBlockAnnotationBlocks("@return", docBlock),
        signature: signature,
        throws: this.getDocBlockAnnotationBlocks("@throws", docBlock),
      });
    });

    return methods;
  }

  /**
   * Parse the specified array of property doc blocks and return an array of
   * property-related data.
   *
   * @param string[] docBlocks
   */
  protected getClassProperties(docBlocks: string[]): any {
    let properties = [];

    if (!docBlocks || docBlocks.length == 0) {
      return properties;
    }

    docBlocks.forEach((docBlock) => {
      let docBlockLinesAsArray = docBlock.split("\n");
      let signature = docBlockLinesAsArray[docBlockLinesAsArray.length - 1].trim().replace(";", "");
      let annotation = this.getDocBlockAnnotationLine("@property", docBlock);

      properties.push({
        access_modifier: signature.split(" ")[0],
        annotation: annotation.line,
        data_type: annotation.data_type,
        description: this.getDocBlockDescription(docBlock),
        example_code: this.getDocBlockExampleCode(docBlock),
        name: annotation.name,
        signature: signature,
      });
    });

    return properties;
  }

  /**
   * Get the `@annotationname` definitions from the doc block.
   *
   * @param string annotation
   *     The annotation to get in the following format: @annotationname.
   * @param string docBlock
   *     The docBlock to get the `@annotationname` definitions from.
   *
   * @return any
   */
  protected getDocBlockAnnotationBlocks(annotation: string, docBlock: string): any {
    //
    // The original regex (without doubling the backslashes) is:
    //
    //     new RegExp(/@annotation.+((\n +\* +)[^@].+)*(?:(\n +\*\n +\* + .*)+)?/, "g");
    //
    // @annotation is the targeted annotation block (e.g., @param).
    //
    let re = new RegExp(annotation + ".+((\n +\\* +)[^@].+)*(?:(\n +\\*\n +\\* + .*)+)?", "g");
    let matches = docBlock.match(re);
    let annotationBlocks = [];

    if (matches) {
      annotationBlocks = matches.map((block) => {
        // Clean up each line and return an overall clean description
        let blockInLines = block.split("\n");
        // Remove the annotation line and get it using the method
        blockInLines.shift();
        let annotationLine = this.getDocBlockAnnotationLine(annotation, block);
        let textBlock = blockInLines.join("\n");
        let description = this.getParagraphs(textBlock);

        return {
          annotation: annotationLine.line,
          data_type: annotationLine.data_type,
          description: description,
          name: annotationLine.name
        };
      });
    }

    return annotationBlocks;
  }

  /**
   * Get the `@annotationname` line.
   *
   * @param string annotation
   *     The annotation to get from the doc block.
   * @param string docBlock
   *     The doc block to get the `@annotationname` definitions from.
   *
   * @return any
   */
  protected getDocBlockAnnotationLine(annotation: string, docBlock: string): any {
    let re = new RegExp(annotation + ".+", "g");
    let match = docBlock.match(re);
    let line = {
      line: null,
      data_type: null,
      name: null
    };

    if (match) {
      let lineParts = match[0].split(" ");
      line.line = match[0];
      line.data_type = lineParts[1];
      line.name = lineParts[2] ? lineParts[2] : null;
    }

    return line;
  }

  /**
   * Get the doc block's description.
   */
  protected getDocBlockDescription(docBlock: string) {
    let docBlocksByLine = docBlock.split("\n");
    let textBlock = "";
    let endOfDescription = false;

    let reAnnotationTag = new RegExp(/@(param|examplecode|return|throws|property)/, "g");

    docBlocksByLine.forEach((line) => {
      if (endOfDescription) {
        return;
      }

      if (line.trim() == "/**") {
        return;
      }

      // If we hit an annotation tag, then that means the we've reached the end
      // of the description
      if (reAnnotationTag.test(line) || line.trim() == "*/") {
        endOfDescription = true;
        return;
      }

      textBlock += `${line}\n`;
    });

    return this.getParagraphs(textBlock);
  }

  /**
   * Get the doc block's example code.
   */
  protected getDocBlockExampleCode(docBlock: string) {
    let reExampleCode = new RegExp(/@examplecode.+((\s).+)+\* ]/, "g");
    let match = docBlock.match(reExampleCode);
    let exampleCodeFiles = [];

    if (!match) {
      return exampleCodeFiles;
    }

    let matchAsString = match[0]
      .replace(/\*/g, "")
      .replace("@examplecode ", "")
      .trim();
    exampleCodeFiles = JSON.parse(matchAsString);

    exampleCodeFiles.forEach((fileData, index) => {
      let decoder = new TextDecoder();
      let fullFilepath = Deno.env().DRASH_DIR_EXAMPLE_CODE + fileData.filepath;
      let fileContentsRaw = Deno.readFileSync(fullFilepath);
      exampleCodeFiles[index].code = decoder.decode(fileContentsRaw);
    });

    return exampleCodeFiles;
  }

  /**
   * Get paragraphs from a text block string.
   *
   * @param string textBlock
   *     The text block containing the paragraph(s).
   *
   * @return string[]
   *     Returns an array of strings. Each element in the array is a paragraph.
   */
  protected getParagraphs(textBlock: string): string[] {
    let textBlockInLines = textBlock.split("\n");

    textBlockInLines = textBlockInLines.map((line) => {
      if (line.trim() === "*") {
        return "---para-break---"
      }
      // A new paragraph is preceded by a "*" and it won't be replaced. We
      // can use this fact to separate paragraphs.
      return line.replace(" * ", "").trim();
    });

    textBlockInLines = textBlockInLines
      .join(" ")
      .split("---para-break---")
      .map((val) => {
        val = val.trim();
        // Remove dashes
        // TODO(crookse) This isn't working correctly and idk if I really care
        // to support it. Might delete.
        if (val.charAt(0) == "-") {
          val.replace("-", "").trim();
        }
        return val;
      });

    textBlockInLines = textBlockInLines.filter((val) => {
      return val.trim() != "";
    });

    return textBlockInLines;
  }
}
