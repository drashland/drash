import Logger from "./logger.ts";

export default class FileLogger extends Logger {
  protected file;

  constructor(configs) {
    super(configs);
    super.type = Logger.TYPE_FILE;
    this.file = configs.file;
  }

  public write(logMethodLevelDefinition, message) {
    const encoder = new TextEncoder();
    let encoded = encoder.encode(`${logMethodLevelDefinition.name} | ${message}\n`);
    Deno.writeFileSync(this.file, encoded, {append: true});
  }
}
