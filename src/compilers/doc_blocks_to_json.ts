//
// TODO(crookse)
//     [ ] Check for multiline method signatures. Example:
//         someMethod(
//           arg1,
//           arg2,
//           arg3
//         ) {
//           // method body
//         }
//     [ ] Check if properties and methods have access modifier. If not, then
//         those members should be placed at the bottom of their respective
//         list.
//     [ ] Check for abstract access modifier.
//     [ ] Support @inheritdoc
//     [ ] Return a status report of the files that were and weren't parsed
//     [ ] Check if a @memberof exists. If not, then document as top-level item.
//

import Drash from "../../mod.ts";

/**
 * @memberof Drash.Compilers
 * @class DocBlocksToJson
 *
 * This compiler reads doc blocks and converts them to parsable JSON.
 */
export default class DocBlocksToJson {

  protected decoder: TextDecoder = new TextDecoder();

  protected re_for_class_doc_block = new RegExp(/@class.+((\n .*)*)?\*\//);
  protected re_for_method_doc_blocks = new RegExp(/\/\*\*((\s)+\*.*)*\s.*\).*{/, "g");
  protected re_for_property_doc_blocks = new RegExp(/\/\*\*((\s)+\*.*)*\s.*[:|=].+;/, "g");
  protected re_ignore_line = new RegExp(/doc-blocks-to-json ignore-line/);
  protected re_members_only = new RegExp(/\/\/\/ +@doc-blocks-to-json members-only/);
  protected re_namespace = new RegExp(/(\*|\*\*) ?@memberof.+/, "g"); // doc-blocks-to-json ignore-line
  protected re_class = new RegExp(/@class +\w+/, "g");
  protected re_function = new RegExp(/@(function|func|method).+/, "g");
  protected re_description_stop_points = new RegExp(/@(param|return|throws)/, "g");

  /**
   * @description
   *     A property to hold the final result of `this.compile()`.
   *
   * @property any parsed
   */
  protected parsed: any = {};

  /**
   * @description
   *     A property to hold the name of the current file being parsed. This
   *     property only exists for debugging purposes. This class has logging to
   *     make it easier for Drash developers and users to find errors during
   *     compilation.
   *
   * @property string current_file
   */
  protected current_file: string = "";

  // FILE MARKER: PUBLIC ///////////////////////////////////////////////////////

  /**
   * @description
   *     Compile a JSON array containing classes, properties, and methods from
   *     the specified files.
   *
   *     All files passed to this method will have their doc blocks parsed for
   *     member data.
   *
   *     Any member that doesn't include the `@memberof` annotation will be
   *     placed as a top-level item.
   *
   * @param string[] files
   *     The array of files containing doc blocks to parse.
   *
   * @return any
   *     Returns the JSON array.
   */
  public compile(files: string[]): any {
    files.forEach((file) => {
      this.current_file = file;
      let fileContentsRaw = Deno.readFileSync(file);
      let fileContents = this.decoder.decode(fileContentsRaw);

      // If a file has `doc-blocks-to-json members-only`...
      if (this.re_members_only.test(fileContents)) {
        this.parseMembersOnlyFile(fileContents);
        return;
      }

      this.parseClassFile(fileContents);
    });

    return this.parsed;
  }

  /**
   * @description
   *     Get the specified `@annotationname` definitions from the specified doc
   *     block.
   *
   * @param string annotation
   *     The annotation to get in the following format: `@annotationname`.
   * @param string docBlock
   *     The docBlock to get the `@annotationname` definitions from.
   *
   * @return any
   *     Returns an array of data related to the specified annotation.
   */
  public getSection(annotation: string, docBlock: string): any {
    //
    // The original regex (without doubling the backslashes) is:
    //
    //     new RegExp(/@annotation\n?.+((\n +\* +)[^@].+)*(?:(\n +\*?\n? +\* + .*)+)?/, "g");
    //
    // @annotation is the targeted annotation block (e.g., @param).
    // The \n after @annotation ensures we can parse @description\n or any other
    // annotation that doesn't have trailing characters.
    //
    let re = new RegExp("\\\* " + annotation + "\n?.+((\n +\\* +)[^@].+)*(?:(\n +\\*?\n? +\\* + .*)+)?", "g");
    let matches = docBlock.match(re);
    let ret: any = {};

    if (!matches) {
      return null;
    }

    if (matches.length <= 0) {
      return null;
    }

    // Parsing @description?
    if (annotation == "@description") {
      let description = [];
      matches.forEach(text => {
        let textBlockByLine = text.split("\n");
        textBlockByLine.shift();
        description = this.getDescription(textBlockByLine.join("\n"));
      });
      return description;
    }

    // Parsing @return?
    if (annotation == "@returns" || annotation == "@return") {
      let annotationBlocks = [];
      matches.forEach(text => {
        let textBlockByLine = text.split("\n");
        textBlockByLine.shift();
        let description = this.getDescription(textBlockByLine.join("\n"));
        let parsedAnnotation = this.getAnnotation(annotation, text);

        annotationBlocks.push({
          description: description,
          annotation: parsedAnnotation
        });
      });
      return annotationBlocks;
    }

    // Parsing @throw?
    if (annotation == "@throws" || annotation == "@throw") {
      let annotationBlocks = [];
      matches.forEach(text => {
        let textBlockByLine = text.split("\n");
        textBlockByLine.shift();
        let description = this.getDescription(textBlockByLine.join("\n"));
        let parsedAnnotation = this.getAnnotation(annotation, text);

        annotationBlocks.push({
          description: description,
          annotation: parsedAnnotation
        });
      });
      return annotationBlocks;
    }

    // Default parsing
    let annotationBlocks = {};
    matches.forEach(text => {
      let textBlockByLine = text.split("\n");
      textBlockByLine.shift();
      let name = this.getMemberName(text, annotation);
      let description = this.getDescription(textBlockByLine.join("\n"));
      let parsedAnnotation = this.getAnnotation(annotation, text);

      annotationBlocks[name] = {
        name: name,
        description: description,
        annotation: parsedAnnotation
      };
    });

    return annotationBlocks;
  }

  // FILE MARKER: PROTECTED ////////////////////////////////////////////////////

  /**
   * @description
   *     Parse the specified class doc block.
   *
   * @param string[] docBlocks
   *     The array of doc blocks to parse.
   *
   * @return any[]
   *     Returns an array of property-related data.
   */
  protected getClassDocBlock(docBlock: string): any {
    let classDocBlock = {
      annotation: null,
      description: [],
    };

    if (!docBlock || docBlock.trim() == "") {
      return classDocBlock;
    }

    let docBlockInLines = docBlock.split("\n");
    let annotation = docBlockInLines.shift();
    let description = docBlockInLines.join("\n");

    classDocBlock.annotation = annotation;
    classDocBlock.description = this.getDescription(description);

    return classDocBlock;
  }

  /**
   * @description
   *     Parse the specified array of method doc blocks and return an array of
   *     method-related data.
   *
   * @param string[] docBlocks
   *     The array of doc blocks to parse.
   *
   * @return any[]
   *     Returns an array of method-related data.
   */
  protected getClassMethods(docBlocks: string[]): any[] {
    let methods = [];

    if (!docBlocks || docBlocks.length == 0) {
      return methods;
    }

    docBlocks.forEach((docBlock) => {
      methods.push(this.getDocBlockDataForMethod(docBlock));
    });

    return methods;
  }

  /**
   * @description
   *     Parse the specified array of property doc blocks and return an array of
   *     property-related data.
   *
   * @param string[] docBlocks
   *     The array of doc blocks to parse.
   *
   * @return any[]
   *     Returns an array of property-related data.
   */
  protected getClassProperties(docBlocks: string[]): any[] {
    let properties = [];

    if (!docBlocks || docBlocks.length == 0) {
      return properties;
    }

    docBlocks.forEach((docBlock) => {
      let docBlockLinesAsArray = docBlock.split("\n");
      let signature = docBlockLinesAsArray[docBlockLinesAsArray.length - 1]
        .trim()
        .replace(";", "");

      let annotationBlock = this.getSection("@property", docBlock)[0];
      annotationBlock.access_modifier = signature.split(" ")[0];
      annotationBlock.signature = signature;
      properties.push(annotationBlock);
    });

    return properties;
  }

  /**
   */
  protected getAccessModifier(memberType: string, text: string): string {
    let signature = this.getSignatureOfMethod(text);

    if (memberType == "method") {
      // The constructor's modifier is always public even though the `construct()`
      // line isn't written as `public construct()`
      let accessModifier = /constructor/.test(signature)
        ? "public"
        : signature.split(" ")[0];

      return accessModifier;
    }
  }

  protected getSignatureOfMethod(text: string): string {
    // The signature is the last line of the doc block
    let textByLine = text.split("\n");
    return textByLine[textByLine.length - 1].trim().replace(/ ?{/, "");
  }

  /**
   * @description
   *     Get the `@annotationname` line.
   *
   * @param string annotation
   *     The annotation to get from the doc block.
   * @param string docBlock
   *     The doc block to get the `@annotationname` definitions from.
   *
   * @return any
   *     Returns an object containing the annotation lines data.
   */
  protected getAnnotation(annotation: string, docBlock: string): any {
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
   * @description
   *     Get the description of the specified doc block. The description is the
   *     start of the doc block down to one of the annotation tags: `@param`,
   *     `@return`, `@throws`.
   *
   * @param string textBlock
   *     The text block in question.
   *
   * @return string[]
   *     Returns an array of descriptions.
   */
  protected getDescription(textBlock: string): string[] {
    let textBlockByLine = textBlock.split("\n");
    let result = "";
    let endOfDescription = false;

    textBlockByLine.forEach((line) => {
      if (endOfDescription) {
        return;
      }

      // Is this the beginning of a doc block?
      if (line.trim() == "/**") {
        line = line.trim().replace("/**", "");
      }

      // If we hit an annotation tag, then that means the we've reached the end
      // of the description. Also, if we've hit the */ line, then that means
      // we've hit the end of the doc block and no more parsing is needed.
      if (this.re_description_stop_points.test(line) || line.trim() == "*/") {
        endOfDescription = true;
        return;
      }

      result += `${line}\n`;
    });

    return this.getParagraphs(result);
  }

  /**
   * @description
   *     Get paragraphs from a text block.
   *
   * @param string textBlock
   *     The text block containing the paragraph(s).
   *
   * @return string[]
   *     Returns an array of strings. Each element in the array is a separate
   *     paragraph.
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
      .join("\n")
      .split("---para-break---")
      .map((val) => {
        return val.trim();
      });

    // Filter out lines that don't contain anything
    textBlockInLines = textBlockInLines.filter((val) => {
      return val.trim() != "";
    });

    return textBlockInLines;
  }

  /**
   * @description
   *     Parse a file that has the `doc-blocks-to-json members-only` comment.
   *
   * @param string fileContents
   */
  protected parseMembersOnlyFile(fileContents) {
    Drash.core_logger.debug(`Parsing members-only file: ${this.current_file}.`);
    let methodDocBlocks = fileContents.match(this.re_for_method_doc_blocks);

    methodDocBlocks.forEach(docBlock => {
      let currentNamespace = this.getAndCreateNamespace(docBlock);
      let memberName = this.getMemberName(docBlock);
      let data = this.getDocBlockDataForMethod(docBlock);
      data.fully_qualified_name = currentNamespace + "." + memberName,
      this.parsed[currentNamespace][memberName] = data;
    });
  }

  /**
   * @description
   *     Parse a file (assuming it's a class file). `this.compile()` defaults to
   *     using this method.
   *
   * @param string fileContents
   */
  protected parseClassFile(fileContents) {
    Drash.core_logger.debug(`Parsing class file: ${this.current_file}.`);
    let methodDocBlocks = fileContents.match(this.re_for_method_doc_blocks);

    let currentNamespace = this.getAndCreateNamespace(fileContents);
    let className = this.getMemberName(fileContents);
    let fullyQualifiedName = currentNamespace + "." + className;

    this.parsed[currentNamespace][className] = {
      methods: {},
      properties: {}
    };

    methodDocBlocks.forEach(docBlock => {
      let methodName = this.getMemberName(docBlock, "method");
      let data = this.getDocBlockDataForMethod(docBlock);
      data.fully_qualified_name = fullyQualifiedName + "." + methodName;
      this.parsed[currentNamespace][className].methods[methodName] = data;
    });
  }

  /**
   * @description
   *     Get the value of the `@memberof` annotation and use it to create a key
   *     in `this.parsed`.
   *
   * @param string text
   *     The text in question.
   *
   * @return string
   */
  protected getAndCreateNamespace(text: string): string {
    // Look for a namespace using the value of the `@memberof` annotation. If
    // a namespace isn't found, then the file being parsed will be placed as a
    // top-level item in the JSON array.
    if (!this.re_namespace.test(text)) {
      return;
    }

    // Create the namespace by taking the `@memberof Some.Namespace` and
    // transforming it into `Some.Namespace`
    let reNamespaceResults = text.match(this.re_namespace);
    let currentNamespace = null;
    reNamespaceResults.forEach(fileLine => {
      if (currentNamespace) {
        return;
      }
      if (this.re_ignore_line.test(fileLine)) {
        return;
      }
      currentNamespace = fileLine
        .trim()
        // TODO(crookse) parse this better... shouldn't have to ignore the line
        .replace(/\*? ?@memberof +/, "") // doc-blocks-to-json-ignore-line
        .trim();
    });

    // Create the namespace in the `parsed` property so we can start storing
    // the namespace's members in it
    if (!this.parsed.hasOwnProperty(currentNamespace)) {
      this.parsed[currentNamespace] = {};
    }

    return currentNamespace;
  }

  /**
   * @description
   *     Get the value of the `@class` annotation.
   *
   * @param string text
   *     The text in question.
   *
   * @return string
   */
  protected getMemberName(text: string, textType?: string): string {
    let matches;

    // Is there a @class annotation?
    matches = text.match(/@class.+/g);
    if (matches && matches.length > 0) {
      Drash.core_logger.debug(`Using @class annotation ${this.current_file}.`);
      let memberName = text
        .match(/@class.+/g)[0]
        .replace(/@class +?/, "")
        .trim();
      return memberName;
    }

    // Is there a @function|func|method annotation?
    matches = text.match(/@(function|func|method).+/g);
    if (matches && matches.length > 0) {
      Drash.core_logger.debug(`Using @function|func|method annotation for ${this.current_file}.`);
      let memberName = text
        .match(/@(function|func|method).+/g)[0]
        .replace(/@(function|func|method) +?/, "")
        .trim();
      return memberName;
    }

    // No annotations? Default to this.
    let textByLine = text.split("\n");
    let line;
    switch (textType) {
      case "method":
        line = textByLine[textByLine.length - 1];
        return line.trim().replace(/(public|protected|private) /g, "").split("(")[0];
      case "@param":
        line = textByLine[0];
        return line.trim().replace(/ ?\* /g, "").trim().split(" ")[2];
      default:
        break;
    }

    Drash.core_logger.error(`Member name could not be found for ${this.current_file}.`)

    return undefined;
  }

  protected getDocBlockDataForMethod(text: string): any {
    return {
      access_modifier: this.getAccessModifier("method", text),
      name: this.getNameOfMethod(text),
      description: this.getSection("@description", text),
      params: this.getSection("@param", text),
      returns: this.getSection("@return", text),
      throws: this.getSection("@throws", text),
      signature: this.getSignatureOfMethod(text)
    };
  }

  protected getNameOfMethod(text: string): string {
    let signature = this.getSignatureOfMethod(text);
    return signature
      .replace(/(public|private|protected) +/, "")
      .replace(/\(.+/, "");
  }
}
