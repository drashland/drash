const decoder = new TextDecoder();
const encoder = new TextEncoder();

class Docable {

  protected filepaths: string[];
  protected json_output: {[k: string]: string[]} = {};
  protected output_file: string;

  constructor(filepaths: string[], outputFile: string) {
    this.filepaths = filepaths;
    this.output_file = outputFile;
  }

  public run() {
    this.filepaths.forEach(async (filepath: string) => {

      const fileContents = await this.getFileContents(filepath);

      // Get the full class name and only continue with the script if it's found
      const fullClassName = this.getFullClassName(fileContents);
      if (!fullClassName) {
        console.log(`File "${filepath}" is missing the "/// Class:" comment at the top of the file.`);
        Deno.exit(1);
      }

      this.json_output[fullClassName as string] = [];

      const members = this.getAllDataMembers(fileContents);

      if (!members) {
        console.log(`File "${filepath}" does not have any doc blocks.`);
        Deno.exit(1);
      }

      (members as string[]).forEach((member: string) => {
        this.json_output[fullClassName as string].push(member);
      });

      console.log(this.json_output);
    });

    // await Deno.writeFile(this.output_filepath, encoder.encode(this.json_output));
  }

  protected getAllDataMembers(fileContents: string): boolean | string[] {
    const members = fileContents.match(/\/\*\*\n[\s\S]*?(?=(;| {))/g);

    if (!members) {
      return false;
    }

    return members;
  }

  protected async getFileContents(filepath: string): Promise<string> {
    return decoder.decode(await Deno.readFile(filepath));
  }

  protected getFullClassName(fileContents: string): boolean | string {
    const fullClassNameMatch = fileContents.match(/\/\/\/ Class:.+/g);

    if (!fullClassNameMatch) {
      return false;
    }

    return fullClassNameMatch[0].replace("/// Class: ", "");
  }
}

const d = new Docable(
  [
    "./src/http/server.ts",
  ],
  "./api_reference.json"
);

d.run();
