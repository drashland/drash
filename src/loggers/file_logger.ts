// namespace Drash.Loggers

import Logger from "./logger.ts";

/**
 * @class FileLogger
 * This logger allows you to log messages to a file.
 */
export default class FileLogger extends Logger {
  protected file: string;

  constructor(configs) {
    super(configs);
    this.file = configs.file;
  }

  public write(logMethodLevelDefinition, message) {
    const encoder = new TextEncoder();
    let encoded = encoder.encode(message + "\n");
    Deno.writeFileSync(this.file, encoded, { append: true });
  }
}
