// namespace Drash.Compilers

export default class DocBlocksToJson {

  protected namespace_tag = "// namespace";
  protected parsed = {};

  // FILE MARKER: PUBLIC ///////////////////////////////////////////////////////

  public parseFiles(files: string[]) {
    const decoder = new TextDecoder();

    for (let index in files) {
      let fileContentsRaw = Deno.readFileSync(files[index]);
      let fileContents = decoder.decode(fileContentsRaw);
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
        return (line.indexOf("class") != -1);
      })[0];

      let classNameSplit = className
        .trim()
        .slice(0, -2)
        .split("class");

      className = classNameSplit[classNameSplit.length - 1].trim();

      this.parsed[currentNamespace][className] = this.parseDocBlocks(fileContents);
    }

    return this.parsed;
  }

  // FILE MARKER: PROTECTED ////////////////////////////////////////////////////

  protected parseDocBlocks(fileContents: string) {
    let properties = {};
    let methods = [];

    let docBlocks = fileContents.toString().split("/**");
    docBlocks.shift(); // Whatever is first doesn't belong

    docBlocks.forEach((docBlock) => {
      methods.push(this.parseDocBlock(docBlock))
    });

    return {
      properties: properties,
      methods: methods
    };
  }

  protected parseDocBlock(docBlock: string) {
    let docBlockLines = docBlock.split("\n");

    // These will be in the final returned object
    let methodName = "";
    let methodSignature = "";
    let methodType = "";
    let methodParams = [];
    let methodReturns = [];
    let methodThrows = [];

    let nextLineIsMethodSignature = false;
    let endOfDocBlock = false;

    docBlockLines.forEach((line) => {
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

      if (line.indexOf("@throws") != -1) {
        let lineSplit = line.split(" ");
        methodThrows.push({
          type: lineSplit[1],
          description: []
        });
        return;
      }

      if (methodThrows.length) {
        let currentMember = methodThrows[methodThrows.length - 1];
        currentMember = this.getMemberDescriptions(currentMember, line);
        return;
      }

      if (line.indexOf("@return") != -1) {
        let lineSplit = line.split(" ");
        methodReturns.push({
          type: lineSplit[1],
          description: []
        });
        return;
      }

      if (methodReturns.length) {
        let currentMember = methodReturns[methodReturns.length - 1];
        currentMember = this.getMemberDescriptions(currentMember, line);
        return;
      }

      if (line.indexOf("@param") != -1) {
        // Clean up last param definition
        let lineSplit = line.split(" ");
        methodParams.push({
          name: lineSplit[2],
          type: lineSplit[1],
          description: []
        });
        return;
      }

      if (methodParams.length) {
        let currentMember = methodParams[methodParams.length - 1];
        currentMember = this.getMemberDescriptions(currentMember, line);
        return;
      }
    });

    return {
      name: methodName,
      type: methodType,
      signature: methodSignature,
      params: methodParams,
      returns: methodReturns,
      throws: methodThrows
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
      member.description.push(line);
    } else {
      member.description[member.description.length - 1] += line;
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
