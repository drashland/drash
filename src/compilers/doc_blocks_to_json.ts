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
  protected re_namespace = new RegExp(/@memberof.+/, "g"); // doc-blocks-to-json ignore-line
  protected re_class = new RegExp(/@class.+/, "g");
  protected re_function = new RegExp(/@(function|func|method).+/, "g");

  /**
   * @property any parsed
   *     A property to hold the final result of `this.compile()`.
   */
  protected parsed: any = {};

  /**
   * @property string current_file
   *     A property to hold the name of the current file being parsed. This
   *     property only exists for debugging purposes. This class has logging to
   *     make it easier for Drash developers and users to find errors during
   *     compilation.
   */
  protected current_file: string = "";

  // FILE MARKER: PUBLIC ///////////////////////////////////////////////////////

  /**
   * Compile a JSON array containing classes, properties, and methods from the
   * specified files by parsing the doc blocks of each file.
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

      // If a file has `@doc-blocks-to-json members-only`...
      if (this.re_members_only.test(fileContents)) {
        this.parseMembersOnly(fileContents);
        return;
      }

      let currentNamespace = this.getAndCreateNamespace(fileContents);
      let memberName = this.getMemberName(fileContents);

      let classDocBlock = fileContents.match(this.re_for_class_doc_block);
      let methodDocBlocks = fileContents.match(this.re_for_method_doc_blocks);
      let propertyDocBlocks = fileContents.match(this.re_for_property_doc_blocks);

      let classDocBlockResults = this.getClassDocBlock(classDocBlock[0] ? classDocBlock[0] : "");

      this.parsed[currentNamespace][memberName] = {
        fully_qualified_name: currentNamespace + "." + memberName,
        name: memberName,
        annotation: classDocBlockResults.annotation,
        description: classDocBlockResults.description,
        properties: this.getClassProperties(propertyDocBlocks),
        methods: this.getClassMethods(methodDocBlocks),
      };
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
   * @return any[]
   *     Returns an array of data related to the specified annotation.
   */
  public getDocBlockSection(annotation: string, docBlock: string): any[] {
    //
    // The original regex (without doubling the backslashes) is:
    //
    //     new RegExp(/@annotation.+((\n +\* +)[^@].+)*(?:(\n +\*?\n? +\* + .*)+)?/, "g");
    //
    // @annotation is the targeted annotation block (e.g., @param).
    //
    let re = new RegExp(annotation + ".+((\n +\\* +)[^@].+)*(?:(\n +\\*?\n? +\\* + .*)+)?", "g");
    let matches = docBlock.match(re);
    let annotationBlocks = [];
    let ret: any = {};

    if (matches) {
      annotationBlocks = matches.map((block) => {
        // Clean up each line and return an overall clean description
        let blockInLines = block.split("\n");
        // Remove the annotation line and get it using the method
        blockInLines.shift();
        let annotationLine = this.getDocBlockAnnotationLine(annotation, block);
        let textBlock = blockInLines.join("\n");
        let description = this.getDocBlockDescription(textBlock);

        if (annotationLine.line) {
          ret.annotation = annotationLine.line;
        }
        if (annotationLine.data_type) {
          ret.data_type = annotationLine.data_type;
        }
        if (annotationLine.name) {
          ret.name = annotationLine.name;
        }
        ret.description = description;

        return ret;
      });
    }

    return annotationBlocks;
  }

  // FILE MARKER: PROTECTED ////////////////////////////////////////////////////

  /**
   * Parse the specified class doc block.
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
    classDocBlock.description = this.getDocBlockDescription(description);

    return classDocBlock;
  }

  /**
   * Parse the specified array of method doc blocks and return an array of
   * method-related data.
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
   * Parse the specified array of property doc blocks and return an array of
   * property-related data.
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

      let annotationBlock = this.getDocBlockSection("@property", docBlock)[0];
      annotationBlock.access_modifier = signature.split(" ")[0];
      annotationBlock.signature = signature;
      properties.push(annotationBlock);
    });

    return properties;
  }

  /**
   */
  protected getAccessModifier(memberType: string, text: string): string {
    let signature = this.getSignatureForMethod(text);

    if (memberType == "method") {
      // The constructor's modifier is always public even though the `construct()`
      // line isn't written as `public construct()`
      let accessModifier = /constructor/.test(signature)
        ? "public"
        : signature.split(" ")[0];

      return accessModifier;
    }
  }

  protected getSignatureForMethod(text: string): string {
    // The signature is the last line of the doc block
    let textByLine = text.split("\n");
    return textByLine[textByLine.length - 1].trim().replace(/ ?{?/, "");
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
   *     Returns an object containing the annotation lines data.
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
   * Get the description of the specified doc block. The description is the
   * start of the doc block down to one of the annotation tags: `@param`,
   * `@return`, `@throws`.
   *
   * @param string textBlock
   *     The text block in question.
   *
   * @return string[]
   *     Returns an array of descriptions.
   */
  protected getDocBlockDescription(textBlock: string): string[] {
    let textBlockByLine = textBlock.split("\n");
    let result = "";
    let endOfDescription = false;

    let reAnnotationTag = new RegExp(/@(param|return|throws)/, "g");

    textBlockByLine.forEach((line) => {
      if (endOfDescription) {
        return;
      }

      if (line.trim() == "/**") {
        return;
      }

      // If we hit an annotation tag, then that means the we've reached the end
      // of the description. Also, if we've hit the */ line, then that means
      // we've hit the end of the doc block and no more parsing is needed.
      if (reAnnotationTag.test(line) || line.trim() == "*/") {
        endOfDescription = true;
        return;
      }

      result += `${line}\n`;
    });

    return this.getParagraphs(result);
  }

  /**
   * Get paragraphs from a text block.
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
   * Parse a file that has the `doc-blocks-to-json members-only` comment.
   *
   * @param string fileContents
   */
  protected parseMembersOnly(fileContents) {
    Drash.core_logger.debug(`Parsing @doc-blocks-to-json members-only for ${this.current_file}.`);
    let methodDocBlocks = fileContents.match(this.re_for_method_doc_blocks);

    methodDocBlocks.forEach(docBlock => {
      let currentNamespace = this.getAndCreateNamespace(docBlock);
      let memberName = this.getMemberName(docBlock);
      this.parsed[currentNamespace][memberName] = this.getDocBlockDataForMethod(docBlock);
    });
  }

  /**
   * Get the value of the `@memberof` annotation and use it to create a key in
   * `this.parsed`.
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
   * Get the value of the `@class` annotation.
   *
   * @param string text
   *     The text in question.
   *
   * @return string
   */
  protected getMemberName(text: string): string {
    if (this.re_class.test(text)) {
      let memberName = text
        .match(/@class +\w+/)[0]
        .replace(/@class +/, "")
        .trim();
      return memberName;
    }

    if (this.re_function.test(text)) {
      let memberName = text
        .match(/@(function|func|method) +\w+/)[0]
        .replace(/@(function|func|method) +/, "")
        .trim();
      return memberName;
    }
  }

  protected getDocBlockDataForMethod(text: string): any {
    return {
      access_modifier: this.getAccessModifier("method", text),
      description: this.getDocBlockSection("@description", text),
      params: this.getDocBlockSection("@param", text),
      returns: this.getDocBlockSection("@return", text),
      throws: this.getDocBlockSection("@throws", text),
      signature: this.getSignatureForMethod(text)
    };
  }
}
