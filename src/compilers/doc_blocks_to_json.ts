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

    for (let index in files) {
      let fileContentsRaw = Deno.readFileSync(files[index]);
      let fileContents = this.decoder.decode(fileContentsRaw);
      let contentsByLine = fileContents.toString().split("\n");
      let currentNamespace = null;

      // No namespace given? GTFO.
      if (contentsByLine[0].indexOf(this.namespace_tag)) {
        return;
      }

      // Create the namespace
      currentNamespace = contentsByLine[0].substring(this.namespace_tag.length).trim();
      if (!this.parsed.hasOwnProperty(currentNamespace)) {
        this.parsed[currentNamespace] = {};
      }

      // Get the class name of the file
      let className = contentsByLine.filter((line) => {
        return (line.indexOf("@class") != -1);
      })[0];
      className = className.replace(" * ", "").trim().split(" ")[1];

      this.parsed[currentNamespace][className] = {
        properties: this.parseDocBlocksForProperties(fileContents),
        methods: this.parseDocBlocksForMethods(fileContents)
      };
    }

    return this.parsed;
  }

  // FILE MARKER: PROTECTED ////////////////////////////////////////////////////

  protected parseDocBlocksForProperties(fileContents: string) {
    let properties = [];

    let docBlocks = fileContents.toString().split("/**");
    // Whatever is first doesn't belong because no doc blocks are contained in the first element
    docBlocks.shift();

    docBlocks.forEach((docBlock) => {
      if (docBlock.indexOf("@property") != -1) {
        properties.push(this.parseDocBlockForProperty(docBlock))
      }
    });

    return properties;
  }

  protected parseDocBlockForProperty(docBlock: string) {
    let docBlockLines = docBlock.split("\n");

    // These will be in the final returned object
    let propertyName = "";
    let propertyType = "";
    let propertySignature = "";
    let propertyDescription = [];
    let propertyAccessModifier = "";
    let propertyExampleCode = [];

    let nextLineIsPropertySignature = false;
    let endOfDocBlock = false;
    let firstParamIndex = -1;

    docBlockLines.forEach((line, index) => {
      if (endOfDocBlock) {
        return;
      }

      if (nextLineIsPropertySignature) {
        endOfDocBlock = true;
        let propertySignatureDetails = this.getPropertySignature(line);
        propertyName = propertySignatureDetails.name;
        propertySignature = propertySignatureDetails.signature;
        propertyAccessModifier = propertySignatureDetails.access_modifier;
        return;
      }

      // Clean up the line
      line = line.replace(" * ", "").trim();

      if (line == "*/") {
        nextLineIsPropertySignature = true;
        return;
      }

      // Line doesn't have any words and junk? Go to the next line.
      if (line == "*") {
        return;
      }

      if (line.indexOf("@property") != -1) {
        if (firstParamIndex === -1) {
          firstParamIndex = index;
        }
        let propertyDetails = line.split(" "); // makes ['access', 'type', 'name']
        propertyType = propertyDetails[1];
        propertyName = propertyDetails[2];
        return;
      }

      if (line.indexOf("@examplecode") != -1) {
        if (firstParamIndex === -1) {
          firstParamIndex = index;
        }
        line = line.replace("@examplecode ", "");
        let fileDetails = line.split(" ");
        let filename = fileDetails[0];
        let language = fileDetails[1];
        let filepath = fileDetails[2];
        let lineHighlight = fileDetails[3] ? fileDetails[3] : '';
        filepath = Deno.env().DRASH_DIR_EXAMPLE_CODE_FOR_DOC_BLOCKS + filepath;
        let fileContentsRaw = Deno.readFileSync(filepath);
        let code = this.decoder.decode(fileContentsRaw);
        propertyExampleCode.push({
          code: code,
          filename: filename,
          language: language,
          line_highlight: lineHighlight
        });
        return;
      }
    });


    let description = "";
    for (let i = 0; i < firstParamIndex; i++) {
      let line = docBlockLines[i];
      line = line.replace(" * ", "").trim();
      if (line != "*") {
        description += `${line} `;
      } else {
        if (description.trim() != "") {
          propertyDescription.push(description.trim());
        }
        description = "";
      }
    }

    return {
      name: propertyName,
      description: propertyDescription,
      type: propertyType,
      access_modifier: propertyAccessModifier,
      signature: propertySignature,
      example_code: propertyExampleCode
    };
  }

  protected getPropertySignature(line: string) {
    let accessModifier = "private";

    line = line.trim();

    if (line.indexOf("protected") != -1) {
      accessModifier = "protected";
    } else if (line.indexOf("public") != -1) {
      accessModifier = "public";
    }

    let signature = line;

    let name = line.split(" ")[1];

    return {
      access_modifier: accessModifier,
      name: name,
      signature: signature
    };
  }

  protected parseDocBlocksForMethods(fileContents: string) {
    let methods = [];

    let docBlocks = fileContents.toString().split("/**");
    docBlocks.shift(); // Whatever is first doesn't belong

    let reForClassDefinition = RegExp('(export default).+class.+{?', "g");

    docBlocks.forEach((docBlock) => {
      if (reForClassDefinition.test(docBlock)) {
        return;
      }
      if (docBlock.indexOf("@property") != -1) {
        return;
      }
      methods.push(this.parseDocBlockForMethod(docBlock));
    });

    return methods;
  }

  protected parseDocBlockForMethod(docBlock: string) {
    let docBlockLines = docBlock.split("\n");

    // These will be in the final returned object
    let methodName = "";
    let methodSignature = "";
    let methodDescription= [];
    let methodType = "";
    let methodParams = [];
    let methodReturns = [];
    let methodThrows = [];
    let methodExampleCode = [];

    let nextLineIsMethodSignature = false;
    let endOfDocBlock = false;
    let firstParamIndex = -1;

    docBlockLines.forEach((line, index) => {
      if (endOfDocBlock) {
        return;
      }

      if (nextLineIsMethodSignature) {
        endOfDocBlock = true;
        let methodSignatureDetails = this.getMethodSignature(line);
        methodName = methodSignatureDetails.name;
        methodSignature = methodSignatureDetails.signature;
        methodType = methodSignatureDetails.type;
        return;
      }

      // Clean up the line
      line = line.replace(" * ", "").trim();

      if (line == "*/") {
        nextLineIsMethodSignature = true;
        return;
      }

      if (line == "*") {
        return;
      }

      if (line.indexOf("@examplecode") != -1) {
        if (firstParamIndex === -1) {
          firstParamIndex = index;
        }
        line = line.replace("@examplecode ", "");
        let fileDetails = line.split(" ");
        let filename = fileDetails[0];
        let language = fileDetails[1];
        let filepath = fileDetails[2];
        let lineHighlight = fileDetails[3] ? fileDetails[3] : '';
        filepath = Deno.env().DRASH_DIR_EXAMPLE_CODE_FOR_DOC_BLOCKS + filepath;
        let fileContentsRaw = Deno.readFileSync(filepath);
        let code = this.decoder.decode(fileContentsRaw);
        methodExampleCode.push({
          code: code,
          filename: filename,
          language: language,
          line_highlight: lineHighlight
        });
        return;
      }

      if (line.indexOf("@throws") != -1) {
        if (firstParamIndex === -1) {
          firstParamIndex = index;
        }
        let lineSplit = line.split(" ");
        methodThrows.push({
          type: lineSplit[1],
          description: []
        });
        return;
      }

      if (methodThrows.length > 0) {
        let currentMember = methodThrows[methodThrows.length - 1];
        currentMember = this.getMemberDescriptions(currentMember, line);
        return;
      }

      if (line.indexOf("@return") != -1) {
        if (firstParamIndex === -1) {
          firstParamIndex = index;
        }
        let lineSplit = line.split(" ");
        methodReturns.push({
          type: lineSplit[1],
          description: []
        });
        return;
      }

      if (methodReturns.length > 0) {
        let currentMember = methodReturns[methodReturns.length - 1];
        currentMember = this.getMemberDescriptions(currentMember, line);
        return;
      }

      if (line.indexOf("@param") != -1) {
        if (firstParamIndex === -1) {
          firstParamIndex = index;
        }
        // Clean up last param definition
        let lineSplit = line.split(" ");
        methodParams.push({
          name: lineSplit[2],
          type: lineSplit[1],
          description: []
        });
        return;
      }

      if (methodParams.length > 0) {
        let currentMember = methodParams[methodParams.length - 1];
        currentMember = this.getMemberDescriptions(currentMember, line);
        return;
      }
    });


    let description = "";
    for (let i = 0; i < firstParamIndex; i++) {
      let line = docBlockLines[i];
      line = line.replace(" * ", "").trim();
      if (line != "*") {
        description += `${line} `;
      } else {
        methodDescription.push(description);
        description = "";
      }
    }

    methodDescription.forEach((description, index) => {
      methodDescription[index] = description.trim();
    });
    methodReturns.forEach((ret, index) => {
      ret.description.forEach((description, index) => {
        ret.description[index] = description.trim();
      });
    });
    methodParams.forEach((param, index) => {
      param.description.forEach((description, index) => {
        param.description[index] = description.trim();
      });
    });
    methodThrows.forEach((error, index) => {
      error.description.forEach((description, index) => {
        error.description[index] = description.trim();
      });
    });

    return {
      name: methodName,
      description: methodDescription,
      type: methodType,
      signature: methodSignature,
      params: methodParams,
      returns: methodReturns,
      throws: methodThrows,
      example_code: methodExampleCode
    };
  }

  protected getMemberDescriptions(member: any, line: string) {
    let newParagraph = false;
    line = line.trim();
    if (line.charAt(0) === "-") {
      // Remove the "-"" bullet
      line = line.substring(2);
      newParagraph = true;
    }

    if (member.description.length <= 0 || newParagraph) {
      member.description.push(`${line} `);
    } else {
      member.description[member.description.length - 1] += `${line} `;
    }

    return member;
  }

  protected getMethodSignature(line: string) {
    let type = "private";

    if (line.indexOf("protected") != -1) {
      type = "protected";
    } else if (line.indexOf("public") != -1) {
      type = "public";
    }

    let signature = line
      .replace("function ", "")
      .slice(0, -2)
      .trim();

    let name = signature;
    name = signature.replace("async ", "").split("(")[0];
    if (name != "constructor") {
      name = name.split(" ")[1];
    } else {
      type = "constructor";
    }

    return {
      signature: signature,
      type: type,
      name: name
    };
  }
}
