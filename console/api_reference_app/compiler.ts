import { BufReader } from "../../deps.ts";

//
// @method compileLazy
// @method compileJson
//

export default class ClassCompiler {
  protected path: string = "";

  protected re_doc_block_closing_slash = new RegExp(/\*\//);
  protected re_doc_block_opening_slash = new RegExp(/\/\*\*?/);
  protected re_method_opening_bracket = new RegExp(/\{/);
  protected re_property_closing_semicolon = new RegExp(/\;/);

  protected re_is_class = new RegExp(/\* @class/);
  protected re_is_enum = new RegExp(/@enum +\w+/);
  protected re_is_function = new RegExp(/@(function|func|method) +\w+/);
  protected re_is_interface = new RegExp(/@interface +\w+/);
  protected re_is_const = new RegExp(/export? ?const \w+ +?= +?.+/, "g");
  protected re_is_method = new RegExp(
    /.+(static|public|protected|private)( async)? \w+\((\n.+)?(\n +\))?.+((\n? + .+:.+,?)+{)?/,
  );
  protected re_is_constructor = new RegExp(/.+constructor\((.+)?\)?/);
  protected re_is_property = new RegExp(/@property/);
  protected re_members_only = new RegExp(/\/\/\/ +@members-only/);
  protected re_namespace = new RegExp(/@memberof.+/);

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////
  // FILE MARKER: PUBLIC ///////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public setPath(path: string): void {
    if (path.trim() == "") {
      throw new Error("Path is required.");
    }
    this.path = path;
  }

  public async compileLazy(): Promise<any> {
    const contents = await Deno.readAll(await Deno.open(this.path));
    const br = await this.getBufReader(contents);
    let docBlock: string = "";
    let docBlockFound: boolean = false;
    let lookForSignature: boolean = false;
    let result: any[] = [];
    let signature = "";

    for (;;) {
      let line: any = await br.readLine();

      // Yay! We made it! (maybe)...
      if (line === null) {
        break;
      }

      line = line.line;
      const dLine = new TextDecoder().decode(line);

      // Are we looking for the data member's signature? If so, start adding
      // subsequent lines to the result until we find the end of the data
      // member's signature.
      if (lookForSignature) {
        if (
          this.re_property_closing_semicolon.test(dLine) ||
          this.re_method_opening_bracket.test(dLine)
        ) {
          docBlockFound = false;
          lookForSignature = false;
          if (this.re_property_closing_semicolon.test(dLine)) {
            signature += dLine.trim();
          } else if (this.re_method_opening_bracket.test(dLine)) {
            signature += dLine.replace("\{", "{ }").trim();
          }
          // We're done finding everything, so now we can push our results to
          // the array and move on to the next section
          let memberType = "method";
          if (docBlock.includes("@property")) {
            memberType = "property";
          }
          if (docBlock.includes("@class")) {
            memberType = "class";
          }
          result.push({
            doc_block: docBlock,
            signature: signature,
            member_type: memberType,
          });
          // Reset the variables for the next section
          docBlock = "";
          signature = "";
          continue;
        }
        signature += dLine.trimLeft();
        continue;
      }

      // Was the doc block closing slash found? If so, set necessary flags so we
      // know that subsequent lines will be the data member signature.
      if (this.re_doc_block_closing_slash.test(dLine)) {
        lookForSignature = true;
        docBlock += (dLine + "\n").trimLeft();
        continue;
      }

      // Was the doc block opening slash found? If so, set necessary flags so we
      // know that subsequent lines belong to the doc block.
      if (this.re_doc_block_opening_slash.test(dLine)) {
        docBlockFound = true;
        docBlock += (dLine + "\n").trimLeft();
        continue;
      }

      // Was the doc block opening slash found? If so, then we can start
      // concatenating subsequent lines to the doc block.
      if (docBlockFound) {
        docBlock += (dLine + "\n").trimLeft();
      }
    }

    return result;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER: PROTECTED ////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  protected async getBufReader(contents: any): Promise<any> {
    const br = new BufReader(new Deno.Buffer(contents));
    return br;
  }
}
