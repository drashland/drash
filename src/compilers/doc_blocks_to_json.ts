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
//

import Drash from "../../mod.ts";

/**
 * @memberof Drash.Compilers
 * @class DocBlocksToJson
 *
 * This compiler reads doc blocks and converts them to parsable JSON.
 */
export default class DocBlocksToJson {

  protected decoder: TextDecoder;

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
    this.decoder = new TextDecoder();

    files.forEach((file) => {
      this.current_file = file;
      let fileContentsRaw = Deno.readFileSync(file);
      let fileContents = this.decoder.decode(fileContentsRaw);

      // Look for a namespace using the value of the `@memberof` annotation. If
      // a namespace isn't found, then the file being parsed will be placed as a
      // top-level class in the JSON array.
      let reNamespace = new RegExp(/\* @memberof.+/, "g"); // doc-blocks-to-json ignore
      if (!reNamespace.test(fileContents)) {
        return;
      }

      // Create the namespace by taking the `@memberof Some.Namespace` and
      // transforming it into `Some.Namespace`
      let reNamespaceResults = fileContents.match(reNamespace);
      let reNamespaceIgnore = new RegExp(/doc-blocks-to-json ignore/);
      let currentNamespace = null;
      reNamespaceResults.forEach(fileLine => {
        if (currentNamespace) {
          return;
        }
        if (reNamespaceIgnore.test(fileLine)) {
          return;
        }
        currentNamespace = fileLine.trim().replace(/\* @memberof/, "").trim(); // doc-blocks-to-json-ignore
      });

      // Create the namespace in the `parsed` property so we can start storing
      // the namespace's members in it
      if (!this.parsed.hasOwnProperty(currentNamespace)) {
        this.parsed[currentNamespace] = {};
      }

      // Get the class name of the current file being parsed. There should only
      // be one `@class` tag in the file. If there are more than one `@class`
      // tag, then the first one will be chosen. The others won't matter. Sorry.
      let className = fileContents
        .match(/@class \w+/)[0]
        .substring("@class".length)
        .trim();

      let classDocBlock = fileContents.match(/@class.+((\n .*)*)?\*\//);
      let methodDocBlocks = fileContents.match(/\/\*\*((\s)+\*.*)*\s.*\).*{/g);
      let propertyDocBlocks = fileContents.match(/\/\*\*((\s)+\*.*)*\s.*[:|=].+;/g);

      let classDocBlockResults = this.getClassDocBlock(classDocBlock[0] ? classDocBlock[0] : "");

      this.parsed[currentNamespace][className] = {
        fully_qualified_name: currentNamespace + "." + className,
        name: className,
        annotation: classDocBlockResults.annotation,
        description: classDocBlockResults.description,
        properties: this.getClassProperties(propertyDocBlocks),
        methods: this.getClassMethods(methodDocBlocks),
      };
    });

    return this.parsed;
  }

  /**
   * Get the specified `@annotationname` definitions from the specified doc
   * block.
   *
   * @param string annotation
   *     The annotation to get in the following format: `@annotationname`.
   * @param string docBlock
   *     The docBlock to get the `@annotationname` definitions from.
   *
   * @return any[]
   *     Returns an array of data related to the specified annotation.
   */
  public getDocBlockAnnotationBlocks(annotation: string, docBlock: string): any[] {
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

    if (matches) {
      annotationBlocks = matches.map((block) => {
        // Clean up each line and return an overall clean description
        let blockInLines = block.split("\n");
        // Remove the annotation line and get it using the method
        blockInLines.shift();
        let annotationLine = this.getDocBlockAnnotationLine(annotation, block);
        let textBlock = blockInLines.join("\n");
        let description = this.getDocBlockDescription(textBlock);

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
      let commonData = this.getClassCommonData(docBlock);
      commonData.signature = commonData.signature.replace(/ ?{/g, "");
      // TODO(crookse) This could use some work
      let name = commonData.signature.split(" ");
      if (name[1]) {
        name = name[1].split("(")[0];
      } else {
        name = null;
      }
      name = commonData.access_modifier == "constructor"
        ? "constructor"
        : name;

      methods.push(Object.assign(commonData, {
        access_modifier: commonData.access_modifier,
        name: name,
        params: this.getDocBlockAnnotationBlocks("@param", docBlock),
        returns: this.getDocBlockAnnotationBlocks("@return", docBlock),
        throws: this.getDocBlockAnnotationBlocks("@throws", docBlock),
      }));
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

      let annotationBlock = this.getDocBlockAnnotationBlocks("@property", docBlock)[0];
      annotationBlock.access_modifier = signature.split(" ")[0];
      annotationBlock.signature = signature;
      properties.push(annotationBlock);
    });

    return properties;
  }

  /**
   * Get the common doc block data between a class' property doc blocks and
   * method doc blocks.
   *
   * @param string docBlock
   *     The doc block in question.
   *
   * @return any
   *     Returns an access modifier, description, and signature.
   */
  protected getClassCommonData(docBlock: string): any {
    let docBlockLinesAsArray = docBlock.split("\n");

    // The signature is the last line of the doc block
    let signature = docBlockLinesAsArray[docBlockLinesAsArray.length - 1].trim()

    // The constructor's modifier is always public even though the `construct()`
    // line isn't written as `public construct()`
    let accessModifier = /constructor/.test(signature)
      ? "public"
      : signature.split(" ")[0];

    return {
      access_modifier: accessModifier,
      description: this.getDocBlockDescription(docBlock),
      signature: signature
    };
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
}
