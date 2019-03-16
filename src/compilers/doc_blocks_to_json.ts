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

      // let methodDocBlocks = fileContents.match(/\/\*\*((\s).+)+\*\/+\s.+\(*\)/g);
      let methodDocBlocks = fileContents.match(/\/\*\*((\s)+\*.*)*\s.*\)/g);
      let propertyDocBlocks = fileContents.match(/\/\*\*((\s)+\*.*)*\s.*;/g);

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

    docBlocks.forEach((docBlock) => {
      let docBlockLinesAsArray = docBlock.split("\n");
      let signature = docBlockLinesAsArray[docBlockLinesAsArray.length - 1].trim();

      methods.push({
        access_modifier: signature.split(" ")[0],
        description: this.getDocBlockDescription(docBlock),
        name: signature.split(" ")[1].split("(")[0], // This could use some work
        params: this.getDocBlockParams(docBlock),
        signature: signature,
        returns: this.getDocBlockReturns(docBlock),
        throws: this.getDocBlockThrows(docBlock),
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

    docBlocks.forEach((docBlock) => {
      let docBlockLinesAsArray = docBlock.split("\n");
      let signature = docBlockLinesAsArray[docBlockLinesAsArray.length - 1].trim();
      let annotation = this.getDocBlockAnnotation("@property", docBlock);

      properties.push({
        access_modifier: signature.split(" ")[0],
        annotation: annotation,
        data_type: annotation.split(" ")[1],
        description: this.getDocBlockDescription(docBlock),
        example_code: this.getDocBlockExampleCode(docBlock),
        name: annotation.split(" ")[2],
        signature: signature,
      });
    });

    return properties;
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
      if (reAnnotationTag.test(line)) {
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

    if (match) {
      let matchAsString = match[0]
        .replace(/\*/g, "")
        .replace("@examplecode ", "")
        .trim();
      exampleCodeFiles = JSON.parse(matchAsString);
    }

    exampleCodeFiles.forEach((fileData, index) => {
      let fullFilepath = Deno.env().DRASH_DIR_EXAMPLE_CODE + fileData.filepath;
      let fileContentsRaw = Deno.readFileSync(fullFilepath);
      exampleCodeFiles[index].code = this.decoder.decode(fileContentsRaw);
    });

    return exampleCodeFiles;
  }

  /**
   * Get the `@param` definitions from the doc block.
   *
   * @param string docBlock
   *     The docBlock to get the `@param` definitions from.
   *
   * @return any
   */
  protected getDocBlockParams(docBlock: string): any {
    let reParams = new RegExp(/@param.+((\s.*).+     .*)*(\s*\*\s+)*(\w).*/, "g");
    let paramBlocks = docBlock.match(reParams);
    let params = [];

    if (paramBlocks) {
      //
      // A `paramBlock` is the entire `@param` annotation. Example:
      //
      //     @param type name
      //         Some description.
      //
      params = paramBlocks.map((paramBlock) => {
        // Clean up each line and return an overall clean description
        let paramBlockInLines = paramBlock.split("\n");
        paramBlockInLines.shift(); // remove the annotation line
        let annotation = this.getDocBlockAnnotation("@param", paramBlock);
        let textBlock = paramBlockInLines.join("\n");
        let description = this.getParagraphs(textBlock);

        return {
          annotation: annotation,
          data_type: annotation.split(" ")[1],
          description: description,
          name: annotation.split(" ")[2],
        };
      });
    }

    return params;
  }

  /**
   * Get the `@return` definitions from the doc block.
   *
   * @param string docBlock
   *     The docBlock to get the `@return` definitions from.
   *
   * @return any
   */
  protected getDocBlockReturns(docBlock: string): any {
    let reReturn = new RegExp(/@return.+((\s.*).+     .*)*(\s*\*\s+)*(\w).*/, "g");
    let retBlocks = docBlock.match(reReturn);
    let ret = [];

    if (retBlocks) {
      //
      // A `retBlock` is the entire `@param` annotation. Example:
      //
      //     @param type name
      //         Some description.
      //
      ret = retBlocks.map((retBlock) => {
        // Clean up each line and return an overall clean description
        let retBlockInLines = retBlock.split("\n");
        retBlockInLines.shift(); // remove the annotation line
        let annotation = this.getDocBlockAnnotation("@return", retBlock);
        let textBlock = retBlockInLines.join("\n");
        let description = this.getParagraphs(textBlock);

        return {
          annotation: annotation,
          data_type: annotation.split(" ")[1],
          description: description,
        };
      });
    }

    return ret;
  }

  /**
   * Get the `@throws` definitions from the doc block.
   *
   * @param string docBlock
   *     The docBlock to get the `@throws` definitions from.
   *
   * @return any
   */
  protected getDocBlockThrows(docBlock: string): any {
    let reThrows = new RegExp(/@throws.+((\s.*).+     .*)*(\s*\*\s+)*(\w).*/, "g");
    let throwsBlocks = docBlock.match(reThrows);
    let throws = [];

    if (throwsBlocks) {
      //
      // A `throwsBlock` is the entire `@param` annotation. Example:
      //
      //     @param type name
      //         Some description.
      //
      throws = throwsBlocks.map((throwsBlock) => {
        // Clean up each line and return an overall clean description
        let throwsBlockInLines = throwsBlock.split("\n");
        throwsBlockInLines.shift(); // remove the annotation line
        let annotation = this.getDocBlockAnnotation("@throws", throwsBlock);
        let textBlock = throwsBlockInLines.join("\n");
        let description = this.getParagraphs(textBlock);

        return {
          annotation: annotation,
          data_type: annotation.split(" ")[1],
          description: description,
        };
      });
    }

    return throws;
  }

  /**
   * Get the `@property` definitions from the doc block.
   *
   * @param string annotation
   *     The annotation to get from the doc block.
   * @param string docBlock
   *     The doc block to get the `@property` definitions from.
   *
   * @return string
   */
  protected getDocBlockAnnotation(annotation: string, docBlock: string): string {
    let reProperty = new RegExp(annotation + ".+", "g");
    let match = docBlock.match(reProperty);
    let line = "";

    if (match) {
      line = match[0];
    }

    return line;
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
        return val.trim();
      });

    // Any empty elements need to go bye bye
    if (textBlockInLines[textBlockInLines.length - 1] == "") {
      textBlockInLines.pop();
    }

    return textBlockInLines;
  }
}
