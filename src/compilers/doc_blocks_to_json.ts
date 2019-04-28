//
// TODO(crookse)
//     [ ] Check for abstract access modifier.
//     [ ] Support @inheritdoc.
//     [ ] Return a status report of the files that were and weren't parsed.
//     [ ] Check if a @memberof exists. If not, then document as top-level item.
//     [ ] Check exported members only properties.
//     [ ] Prase multi-line members only signature (interface already done).
//

import Drash from "../../mod.ts";

/**
 * @memberof Drash.Compilers
 * @class DocBlocksToJson
 *
 * @description
 *     This compiler reads doc blocks and converts them to parsable JSON.
 */
export default class DocBlocksToJson {
  protected re_description_stop_points = new RegExp(
    /@(param|return|throws)/,
    "g"
  );
  protected re_export = new RegExp(/export.+/, "g");
  // protected re_for_all_members = new RegExp(/\/\*\*((\s)+\*.*)+?\s+\*\/\n.+/, "g");
  protected re_for_all_members = new RegExp(/\/\*\*((\s)+\*.*)+?\s+\*\/\n(export)?( +)?(export|constructor|interface|public|protected|private) ?(((\w+ {(\n.+\?:.+;)+)\n})|(((\w+ )*{)|(\w+.+;)|((async|function)? ?(\w+)?\(.+\)?{)|((async|function)? ?(\w+)?\(((\n? + .+:.+,?)+({|(\n( +)?\).+{))))))/, "g");
  protected re_ignore_line = new RegExp(/doc-blocks-to-json ignore-line/);
  protected re_is_class = new RegExp(/\* @class/);
  protected re_is_enum = new RegExp(/@enum +\w+/);
  protected re_is_function = new RegExp(/@(function|func|method) +\w+/); // TODO(crookse) multiline
  protected re_is_interface = new RegExp(/@interface +\w+/);
  protected re_is_ignored_block = new RegExp(/\* @doc-blocks-to-json ignore-doc-block/, "g");
  protected re_is_const = new RegExp(/export? ?const \w+ +?= +?.+/, "g");
  protected re_is_method = new RegExp(/.+(static|public|protected|private)( async)? \w+\((\n.+)?(\n +\))?.+((\n? + .+:.+,?)+{)?/);
  protected re_is_constructor = new RegExp(/.+constructor\((.+)?\)?/);
  protected re_is_property = new RegExp(/@property/);
  protected re_members_only = new RegExp(/\/\/\/ +@doc-blocks-to-json members-only/);
  protected re_namespace = new RegExp(/(\*|\*\*) ?@memberof.+/, "g"); // doc-blocks-to-json ignore-line
  // protected re_class = new RegExp(/@class +\w+/, "g");
  // protected re_for_class_doc_block = new RegExp(/@class.+((\n .*)*)?\*\//);
  // protected re_for_enum_doc_blocks = new RegExp(/\/\*\*((\s)+\*.*)*\s.*enum.+/, "g");
  // protected re_for_interface_doc_blocks = new RegExp(/\/\*\*((\s)+\*.*)*\s.*interface.+/, "g");
  // protected re_for_method_doc_blocks = new RegExp(/\/\*\*((\s)+\*.*)*\s.*\).*{/, "g");
  // protected re_for_property_doc_blocks = new RegExp(/\/\*\*((\s)+\*.*)*\s.*[:|=].+;/, "g");
  // protected re_function = new RegExp(/@(function|func|method).+/, "g");
  protected re__member_names = "@(class|enum|function|func|interface|method|module)";

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

  /**
   * @description
   *     The decoder used to decode the files passed to `this.compile()`.
   *
   * @property TextDecoder decoder
   */
  protected decoder: TextDecoder = new TextDecoder();

  /**
   * @description
   *     A property to hold the final result of `this.compile()`.
   *
   * @property any parsed
   */
  protected parsed: any = {};

  /**
   * Is the compiler currently parsing a file with the `@doc-blocks-to-json
   * members-only` annotation?
   *
   * @property boolean parsing_members_only_file
   */
  protected parsing_members_only_file = false;

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
    files.forEach(file => {
      this.current_file = file;
      let fileContentsRaw = Deno.readFileSync(file);
      let fileContents = this.decoder.decode(fileContentsRaw);

      // If a file has `doc-blocks-to-json members-only`...
      if (this.re_members_only.test(fileContents)) {
        this.parsing_members_only_file = true;
        this.parseMembersOnlyFile(fileContents);
        return;
      }

      this.parsing_members_only_file = false;
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
    let re = new RegExp(
      "\\* " +
        annotation +
        "\n?.+((\n +\\* +)[^@].+)*(?:(\n +\\*?\n? +\\* + .*)+)?",
      "g"
    );
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

    // Parsing the following?
    let arrayedAnnotations = ["@returns", "@return", "@throws", "@throw"];
    if (arrayedAnnotations.indexOf(annotation) != -1) {
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
   *     Get the value of the `@memberof` annotation and use it to create a key
   *     in `this.parsed`.
   *
   * @param string docBlock
   *     The doc block in question.
   *
   * @return string
   */
  protected getAndCreateNamespace(docBlock: string): string {
    // Look for a namespace using the value of the `@memberof` annotation. If
    // a namespace isn't found, then the file being parsed will be placed as a
    // top-level item in the JSON array.
    if (!this.re_namespace.test(docBlock)) {
      return;
    }

    // Create the namespace by taking the `@memberof Some.Namespace` and
    // transforming it into `Some.Namespace`
    let reNamespaceResults = docBlock.match(this.re_namespace);
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

    textBlockByLine.forEach(line => {
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

    return this.getDescriptionInParagraphs(result);
  }

  /**
   * @description
   *     Get paragraphs from the description text blocks.
   *
   * @param string textBlock
   *     The text block containing the paragraph(s).
   *
   * @return string[]
   *     Returns an array of strings. Each element in the array is a separate
   *     paragraph.
   */
  protected getDescriptionInParagraphs(textBlock: string): string[] {
    let textBlockInLines = textBlock.split("\n");

    textBlockInLines = textBlockInLines.map(line => {
      if (line.trim() === "*") {
        return "---para-break---";
      }
      // A new paragraph is preceded by a "*" and it won't be replaced. We
      // can use this fact to separate paragraphs.
      return line.replace(" * ", "").trim();
    });

    textBlockInLines = textBlockInLines
      .join("\n")
      .split("---para-break---")
      .map(val => {
        return val.trim();
      });

    // Filter out lines that don't contain anything
    textBlockInLines = textBlockInLines.filter(val => {
      return val.trim() != "";
    });

    return textBlockInLines;
  }

  /**
   * @description
   *     Get the doc block data for the interface in question.
   *
   * @param string text
   *     The text containing the interface's data.
   *
   * @return any
   */
  protected getDocBlockDataForConst(text: string): any {
    return {
      exported: this.isMemberExported("const", text),
      name: this.getNameOfConst(text),
      description: this.getSection("@description", text)
      // signature: this.getSignatureOfInterface(text)
    };
  }

  /**
   * @description
   *     Get the doc block data for the enum in question.
   *
   * @param string text
   *     The text containing the enum's data.
   *
   * @return any
   */
  protected getDocBlockDataForEnum(text: string): any {
    let ret: any = {
      exported: this.isMemberExported("enum", text),
      name: this.getNameOfEnum(text),
      description: this.getSection("@description", text)
    };

    return ret;
  }

  /**
   * @description
   *     Get the doc block data for the function in question.
   *
   * @param string text
   *     The text containing the functions's data.
   *
   * @return any
   */
  protected getDocBlockDataForFunction(text: string): any {
    let ret: any = {
      exported: this.isMemberExported("function", text),
      name: this.getNameOfFunction(text),
      description: this.getSection("@description", text),
      params: this.getSection("@param", text),
      returns: this.getSection("@return", text),
      throws: this.getSection("@throws", text),
      signature: this.getSignatureOfMethod(text)
    };

    return ret;
  }

  /**
   * @description
   *     Get the doc block data for the interface in question.
   *
   * @param string text
   *     The text containing the interface's data.
   *
   * @return any
   */
  protected getDocBlockDataForInterface(text: string): any {
    return {
      exported: this.isMemberExported("interface", text),
      name: this.getMemberName(text),
      description: this.getSection("@description", text),
      signature: this.getSignatureOfInterface(text)
    };
  }

  /**
   * @description
   *     Get the doc block data for the method in question.
   *
   * @param string text
   *     The text containing the method's data.
   *
   * @return any
   */
  protected getDocBlockDataForMethod(text: string): any {
    let signature = this.getSignatureOfMethod(text);

    // Methods have constructors which are always public, so we want to make
    // sure the `construct()` function's access modifier isn't "constructor"
    // because the access modifier was omitted.
    let accessModifier = /constructor/.test(signature)
      ? "public"
      : signature.split(" ")[0];

    let ret: any = {
      access_modifier: accessModifier,
      name: '', // TODO(crookse) do something about this.. is it needed?
      description: this.getSection("@description", text),
      params: this.getSection("@param", text),
      returns: this.getSection("@return", text),
      throws: this.getSection("@throws", text),
      signature: signature,
      is_async: /async/.test(signature)
    };

    return ret;
  }

  /**
   * @description
   *     Get the doc block data for the property in question.
   *
   * @param string text
   *     The text containing the property's data.
   *
   * @return any
   */
  protected getDocBlockDataForProperty(text: string): any {
    let signature = this.getSignatureOfProperty(text);

    let accessModifier = signature.split(" ")[0];

    let ret: any = {
      access_modifier: accessModifier,
      description: this.getSection("@description", text),
      annotation: this.getAnnotation("@property", text),
      signature: signature
    };

    return ret;
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
    let matches = text.match(new RegExp(this.re__member_names + ".+", "g"));

    if (matches && matches.length > 0) {
      Drash.core_logger.debug(`Using @annotation for ${this.current_file}.`);
      let memberName = text
        .match(new RegExp(this.re__member_names + ".+", "g"))[0]
        .replace(new RegExp(this.re__member_names + " +?", "g"), "")
        .trim();
      return memberName;
    }

    // No annotations? Default to this.
    let textByLine = text.split("\n");
    let line;
    switch (textType) {
      case "@param":
        line = textByLine[0];
        return line
          .trim()
          .replace(/ ?\* /g, "")
          .trim()
          .split(" ")[2];
      case "method":
        line = this.getMemberNameMethod(textByLine);
        return line
          .trim()
          .replace(/(public|protected|private) /g, "")
          .replace(/async /g, "")
          .split("(")[0];
      case "property":
        line = textByLine[textByLine.length - 1];
        return line
          .trim()
          .replace(/(public|protected|private) /g, "")
          .replace(":", "")
          .split(" ")[0];
      default:
        break;
    }

    Drash.core_logger.error(
      `Member name could not be found for ${this.current_file}.`
    );

    return undefined;
  }

  protected getMemberNameInterface(textByLine, index = -1, line = '') {
    if (index == -1) {
      index = textByLine.length - 1;
    }

    line = textByLine[index] + line;
    line = line.trim();

    // Check for the opening bracket because that line will have the
    // interface's name
    let paren = new RegExp(/\{/, "g");
    if (paren.test(line)) {
      // Add new lines so the signature looks like a pretty object
      line = line.replace("{", "{\n  ");
      line = line.replace(/;/g, ";\n  ");
      line = line.replace("  }", "}");
      return line;
    }

    index = index - 1;

    return this.getMemberNameInterface(textByLine, index, line);
  }

  protected getMemberNameMethod(textByLine, index = -1, line = '') {
    if (index == -1) {
      index = textByLine.length - 1;
    }

    line = textByLine[index] + line;
    line = line.trim();

    // Check for the opening parenthesis because that line will have the
    // method's name
    let paren = new RegExp(/\(/, "g");
    if (paren.test(line)) {
      // Add a space after each comma
      line = line.replace(/,/g, ", ");
      // Just one space though...
      line = line.replace(/,  /g, ", ");
      return line;
    }

    index = index - 1;

    return this.getMemberNameMethod(textByLine, index, line);
  }

  /**
   * @description
   *     Get the name of the const.
   *
   * @param string text
   *     The text containing the const's data.
   *
   * @return string
   */
  protected getNameOfConst(text: string): string {
    let textByLine = text.split("\n");
    return textByLine[textByLine.length - 1]
      .trim()
      .replace("export", "")
      .replace("const", "")
      .trim()
      .split(" ")[0];
  }

  /**
   * @description
   *     Get the name of the enum.
   *
   * @param string text
   *     The text containing the enum's data.
   *
   * @return string
   */
  protected getNameOfEnum(text: string): string {
    let textByLine = text.split("\n");
    return textByLine[textByLine.length - 1]
      .trim()
      .replace(/ ?{/, "")
      .replace(/export +? ?enum +?/, "");
  }

  /**
   * @description
   *     Get the name of the function.
   *
   * @param string text
   *     The text containing the function's data.
   *
   * @return string
   */
  protected getNameOfFunction(text: string): string {
    let signature = this.getSignatureOfMethod(text);
    return signature
      .replace(/export +?/, "")
      .replace(/function +?/, "")
      .replace(/\(.+/, "");
  }

  /**
   * @description
   *     Get the name of the property.
   *
   * @param string text
   *     The text containing the property's data.
   *
   * @return string
   */
  protected getNameOfProperty(text: string): string {
    let signature = this.getSignatureOfProperty(text);
    return signature
      .replace(/(public|private|protected) +/, "")
      .replace(/\(.+/, "");
  }

  /**
   * @description
   *     Get the signature of the function in question.
   *
   * @param string text
   *     The text containing the function's data.
   *
   * @return string
   */
  protected getSignatureOfFunction(text: string): string {
    // The signature is the last line of the doc block
    let textByLine = text.split("\n");
    return textByLine[textByLine.length - 1]
      .trim()
      .replace(/ ?{/, "")
      .replace("}", "");
  }

  /**
   * @description
   *     Get the signature of the interface in question.
   *
   * @param string text
   *     The text containing the interface's data.
   *
   * @return string
   */
  protected getSignatureOfInterface(text: string): string {
    let textByLine = text.split("\n");
    return this.getMemberNameInterface(textByLine);
  }

  /**
   * @description
   *     Get the signature of the method in question.
   *
   * @param string text
   *     The text containing the method's data.
   *
   * @return string
   */
  protected getSignatureOfMethod(text: string): string {
    let textByLine = text.split("\n");
    let line = this.getMemberNameMethod(textByLine);

    return line
      .trim()
      .replace(/ ?{/, "")
      .replace("}", "");
  }

  /**
   * @description
   *     Get the signature of the property in question.
   *
   * @param string text
   *     The text containing the property's data.
   *
   * @return string
   */
  protected getSignatureOfProperty(text: string): string {
    // The signature is the last line of the doc block
    let textByLine = text.split("\n");
    return textByLine[textByLine.length - 1].trim().replace(";", "");
  }

  /**
   * Is the member exported?
   *
   * @param string memberType
   *     The member's type.
   * @param string text
   *     The text containing the `export` keyword if the member is exported.
   *
   * @return boolean
   *     Returns true if the member is exported and false if not.
   */
  protected isMemberExported(memberType: string, text: string): boolean {
    let reMemberName = new RegExp(memberType);
    if (this.re_export.test(text)) {
      let exportLine = text.match(this.re_export);
      if (exportLine && exportLine.length > 0) {
        if (reMemberName.test(exportLine[0])) {
          return true;
        }
      }
    }

    return false;
  }

  // FILE MARKER: PROTECTED - PARSERS //////////////////////////////////////////

  /**
   * @description
   *     Parse a file that has the `@doc-blocks-to-json members-only`
   *     annotation.
   *
   * @param string fileContents
   */
  protected parseMembersOnlyFile(fileContents) {
    Drash.core_logger.debug(`Parsing members-only file: ${this.current_file}.`);

    let docBlocks = fileContents.match(this.re_for_all_members);

    docBlocks.forEach(docBlock => {
      if (this.re_is_ignored_block.test(docBlock)) {
        return;
      }

      if (this.re_is_function.test(docBlock)) {
        let currentNamespace = this.getAndCreateNamespace(docBlock);
        let memberName = this.getMemberName(docBlock);
        let data = this.getDocBlockDataForFunction(docBlock);
        data.is_function= true;
        if (!currentNamespace) {
          data.fully_qualified_name = memberName;
          this.parsed[memberName] = data;
        } else {
          data.fully_qualified_name = currentNamespace + "." + memberName;
          this.parsed[currentNamespace][memberName] = data;
        }
        return;
      }

      if (this.re_is_enum.test(docBlock)) {
        let currentNamespace = this.getAndCreateNamespace(docBlock);
        let memberName = this.getMemberName(docBlock);
        let data = this.getDocBlockDataForEnum(docBlock);
        data.is_enum = true;
        if (!currentNamespace) {
          data.fully_qualified_name = memberName;
          this.parsed[memberName] = data;
        } else {
          data.fully_qualified_name = currentNamespace + "." + memberName;
          this.parsed[currentNamespace][memberName] = data;
        }
        return;
      }

      if (this.re_is_interface.test(docBlock)) {
        let currentNamespace = this.getAndCreateNamespace(docBlock);
        let memberName = this.getMemberName(docBlock);
        let data = this.getDocBlockDataForInterface(docBlock);
        data.is_interface = true;
        if (!currentNamespace) {
          data.fully_qualified_name = memberName;
          this.parsed[memberName] = data;
        } else {
          data.fully_qualified_name = currentNamespace + "." + memberName;
          this.parsed[currentNamespace][memberName] = data;
        }
        return;
      }

      if (this.re_is_const.test(docBlock)) {
        let currentNamespace = this.getAndCreateNamespace(docBlock);
        let data = this.getDocBlockDataForConst(docBlock);
        data.is_const = true;
        if (!currentNamespace) {
          data.fully_qualified_name = data.name;
          this.parsed[data.name] = data;
        } else {
          data.fully_qualified_name = currentNamespace + "." + data.name;
          this.parsed[currentNamespace][data.name] = data;
        }
        return;
      }
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

    let docBlocks = fileContents.match(this.re_for_all_members);

    let classMap: any = {
      fully_qualified_name: null,
      namespace: null,
      name: null,
      description: null,
      properties: {},
      methods: {}
    };

    docBlocks.forEach(docBlock => {
      if (this.re_is_class.test(docBlock)) {
        classMap.namespace = this.getAndCreateNamespace(docBlock);
        classMap.name = this.getMemberName(docBlock);
        classMap.description = this.getSection("@description", docBlock);
        classMap.fully_qualified_name = classMap.namespace
          ? `${classMap.namespace}.${classMap.name}`
          : classMap.name;
        return;
      }

      if (this.re_is_property.test(docBlock)) {
        let propertyName = this.getMemberName(docBlock, "property");
        let data = this.getDocBlockDataForProperty(docBlock);
        data.name = propertyName;
        data.fully_qualified_name =
          classMap.fully_qualified_name + "." + propertyName;
        classMap.properties[propertyName] = data;
      }

      if (this.re_is_constructor.test(docBlock)) {
        let methodName = this.getMemberName(docBlock, "method");
        let data = this.getDocBlockDataForMethod(docBlock);
        // TODO(crookse) remove part where constructor is checked... we know
        // it's a constructor, so just assign that here.
        data.name = 'constructor';
        data.fully_qualified_name =
          classMap.fully_qualified_name + "()";
        classMap.methods[methodName] = data;
      }

      if (this.re_is_method.test(docBlock)) {
        let methodName = this.getMemberName(docBlock, "method");
        let data = this.getDocBlockDataForMethod(docBlock);
        // TODO(crookse) find a way to clean this data.name assignment up
        data.name = methodName;
        data.fully_qualified_name =
          classMap.fully_qualified_name + "." + methodName;
        classMap.methods[methodName] = data;
      }
    });

    if (!classMap.namespace) {
      this.parsed[classMap.name] = classMap;
    } else {
      this.parsed[classMap.namespace][classMap.name] = classMap;
    }
  }
}
