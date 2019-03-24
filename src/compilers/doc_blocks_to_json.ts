// namespace Drash.Compilers
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
//

import Drash from "../../mod.ts";

/**
 * @class DocBlocksToJson
 * This compiler reads doc blocks and converts them to parsable JSON.
 *
 * @examplecode [
 *   {
 *     "title": "Example Call",
 *     "filepath": "/api-reference/compilers/doc_blocks_to_json_m_compile_example_call.ts",
 *     "language": "typescript"
 *   }
 * ]
 */
export default class DocBlocksToJson {

  protected decoder: TextDecoder;

  /**
   * A property to hold the final result of the compilation.
   *
   * @property any parsed
   */
  protected parsed: any = {};

  /**
   * A property to hold the name of the current file being parsed. This property
   * only exists for debugging purposes. This class has logging to make it
   * easier for Drash developers and users to find errors during compilation.
   *
   * @property string current_file
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
   *
   * @examplecode [
   *   {
   *     "title": "Example Call",
   *     "filepath": "/api-reference/compilers/doc_blocks_to_json_m_compile_example_call.ts",
   *     "language": "typescript"
   *   },
   *   {
   *     "title": "file.ts",
   *     "filepath": "/api-reference/compilers/doc_blocks_to_json_m_compile_example_input.ts",
   *     "language": "typescript"
   *   },
   *   {
   *     "title": "output.json",
   *     "filepath": "/api-reference/compilers/doc_blocks_to_json_m_compile_example_output.json",
   *     "language": "json"
   *   }
   * ]
   */
  public compile(files: string[]): any {
    this.decoder = new TextDecoder();

    files.forEach((file) => {
      this.current_file = file;
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
      let className = fileContents
        .match(/@class \w+/)[0]
        .substring("@class".length)
        .trim();

      let methodDocBlocks = fileContents.match(/\/\*\*((\s)+\*.*)*\s.*\).*{/g);
      let propertyDocBlocks = fileContents.match(/\/\*\*((\s)+\*.*)*\s.*[:|=].+;/g);
      let classDocBlock = fileContents.match(/@class.+((\n .*)*)?\*\//);

      let classDocBlockResults = this.getClassDocBlock(classDocBlock[0] ? classDocBlock[0] : "");

      this.parsed[currentNamespace][className] = {
        fully_qualified_name: currentNamespace + "." + className,
        name: className,
        annotation: classDocBlockResults.annotation,
        description: classDocBlockResults.description,
        example_code: classDocBlockResults.example_code,
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
   *
   * @examplecode [
   *   {
   *     "title": "Example Call",
   *     "filepath": "/api-reference/compilers/doc_blocks_to_json_m_getDocBlockAnnotationBlocks_example_call.ts",
   *     "language": "typescript"
   *   },
   *   {
   *     "title": "doc_block.txt",
   *     "filepath": "/api-reference/compilers/doc_blocks_to_json_m_getDocBlockAnnotationBlocks_doc_block.txt",
   *     "language": "text"
   *   },
   *   {
   *     "title": "output.json",
   *     "filepath": "/api-reference/compilers/doc_blocks_to_json_m_getDocBlockAnnotationBlocks_output.json",
   *     "language": "json"
   *   }
   * ]
   */
  public getDocBlockAnnotationBlocks(annotation: string, docBlock: string): any[] {
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

  // FILE MARKER: PROTECTED ////////////////////////////////////////////////////

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
      example_code: []
    };

    if (!docBlock || docBlock.trim() == "") {
      return classDocBlock;
    }

    let docBlockInLines = docBlock.split("\n");
    let annotation = docBlockInLines.shift();
    let description = docBlockInLines.join("\n");

    classDocBlock.annotation = annotation;
    classDocBlock.description = this.getDocBlockDescription(description);
    classDocBlock.example_code = this.getDocBlockExampleCode(description);

    return classDocBlock;
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
      let commonData = this.getClassCommonData(docBlock);
      commonData.signature = commonData.signature.replace(";", "");
      // TODO(crookse) Is there a bug here because @property is hard-coded?
      let annotation = this.getDocBlockAnnotationLine("@property", docBlock);

      properties.push(Object.assign(commonData, {
        annotation: annotation.line,
        data_type: annotation.data_type,
        name: annotation.name,
      }));
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
   *     Returns an access modifier, description, example code, and signature.
   */
  protected getClassCommonData(docBlock: string): any {
    let docBlockLinesAsArray = docBlock.split("\n") ;
    let signature = docBlockLinesAsArray[docBlockLinesAsArray.length - 1].trim()
    let accessModifier = /constructor/.test(signature)
      ? "public"
      : signature.split(" ")[0];

    return {
      access_modifier: accessModifier,
      description: this.getDocBlockDescription(docBlock),
      example_code: this.getDocBlockExampleCode(docBlock),
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
   * Get the description of the specified doc block.
   *
   * @param string docblock
   *     The doc block in question.
   *
   * @return string[]
   *     Returns an array of descriptions.
   */
  protected getDocBlockDescription(docBlock: string): string[] {
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
   * Get the example code of the specified doc block.
   *
   * @param string docblock
   *     The doc block in question.
   *
   * @return any[]
   *     Returns an array of the example code.
   */
  protected getDocBlockExampleCode(docBlock: string): any[] {
    let reExampleCode = new RegExp(/\* @examplecode.+\[((\n +?\\* +).+)*(?:(\n +\\*\n +\\* + .*)+)?\* ]/, "g");
    let match = docBlock.match(reExampleCode);
    let exampleCode = [];

    if (!match) {
      return exampleCode;
    }

    let jsonString = match[0]
      .replace(/\*/g, "")
      .replace("@examplecode ", "")
      .trim();

    try {
      Drash.core_logger.debug(`Parsing @examplecode block for ${this.current_file}.`);
      exampleCode = JSON.parse(jsonString);
      Drash.core_logger.debug(`Succesfully parsed.`);
    } catch (error) {
      Drash.core_logger.error(`Error occurred while parsing @examplecode block for ${this.current_file}:`);
      Drash.core_logger.error(error.message);
      return exampleCode;
    }

    let fullFilepath = "";

    exampleCode.forEach((fileData, index) => {
      try {
        let decoder = new TextDecoder();
        fullFilepath = Deno.env().DRASH_DIR_EXAMPLE_CODE + fileData.filepath;
        Drash.core_logger.debug(`Getting file contents from ${fullFilepath}.`);
        let fileContentsRaw = Deno.readFileSync(fullFilepath);
        // Add the `code` property to the beginning
        exampleCode[index].code = decoder.decode(fileContentsRaw);
      } catch (error) {
        Drash.core_logger.error(`Error occurred while getting file contents from ${fullFilepath}:`);
        Drash.core_logger.error(error.message);
      }
    });

    return exampleCode;
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
