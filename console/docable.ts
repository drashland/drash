const decoder = new TextDecoder();
const encoder = new TextEncoder();

interface IJsonOutput {
  file: string;
  members: string[];
}

/**
 * Parse data member doc blocks and signatures and place them in a minimalistic,
 * JSON format.
 *
 * Regex Note 1: The initial expression which matches /**\n.
 * Regex Note 2: After the initial expression, keep going until one of the
 * following groups is matched. For example, "Hey regex, find /** and keep going
 * until you find {}.  Stop at {} and do not include it in what you have
 * matched." The groups to stop at are as follows:
 *
 *   - (\n\n)  -->  double new line
 *   - ( {}\n) -->  {} followed by a new line
 *   - ( {\n)  -->  { followed by a new line
 *   - ( = {)  -->  = {
 *   - (\n$)   -->  a new line where the new line is the end of the line
 */
export class Docable {

  protected filepaths: string[];
  protected json_output: {[k: string]: IJsonOutput} = {};
  protected output_filepath: string;

  constructor(filepaths: string[], outputFilepath: string) {
    this.filepaths = filepaths;
    this.output_filepath = outputFilepath;
  }

  public async run() {
    for (let index in this.filepaths) {
      const filepath = this.filepaths[index];

      const fileContents = await this.getFileContents(filepath);

      // Get the full member name and only continue with the script if it's found
      const fullMemberName = this.getFullMemberName(fileContents);
      if (!fullMemberName) {
        console.log(`File "${filepath}" is missing the "/// Member:" comment at the top of the file.`);
        Deno.exit(1);
      }

      this.json_output[fullMemberName as string] = {
        file: filepath,
        members: []
      };

      const members = this.getAllDataMembers(fileContents);

      if (!members) {
        console.log(`File "${filepath}" does not have any doc blocks.`);
        Deno.exit(1);
      }

      (members as string[]).forEach((member: string) => {
        // We want to clean up the output of the JSON so we remove unnecessary
        // whitespace here
        member = member
          .replace(/   \*/g, " *")
          .replace(/     \*/g, " *")
          .replace(/  protected/g, "protected")
          .replace(/  private/g, "private")
          .replace(/  public/g, "public")
          .replace(/  constructor/g, "constructor");

        this.json_output[fullMemberName as string].members.push(member);
      });

    }

    try {
      await this.writeOutputFile();
      console.log(`Successfully created "${this.output_filepath}" file.`);
    } catch (error) {
      console.log(`Error occurred when creating "${this.output_filepath}" file. See stack trace below.`);
      console.log(error);
    }
  }

  protected getAllDataMembers(fileContents: string): boolean | string[] {
    const members = fileContents
      .match(/\/\*\*\n[\s\S]*?(?=((\n\n)|( {}\n)|( {\n)|( = {)|(\n$)))/g);
      //     \_________/\______________________________________/
      //          |                          |
      //          v                          v
      //      See Regex Note 1            See Regex Note 2
      //      at top of file              at top of file

    if (!members) {
      return false;
    }

    return members;
  }

  protected async getFileContents(filepath: string): Promise<string> {
    return decoder.decode(await Deno.readFile(filepath));
  }

  protected getFullMemberName(fileContents: string): boolean | string {
    const fullMemberNameMatch = fileContents.match(/\/\/\/ Member:.+/g);

    if (!fullMemberNameMatch) {
      return false;
    }

    return fullMemberNameMatch[0].replace("/// Member: ", "");
  }

  protected async writeOutputFile() {
    await Deno.writeFile(this.output_filepath, encoder.encode(JSON.stringify(this.json_output, null, 2)));
  }
}
