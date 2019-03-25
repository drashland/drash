// namespace Drash.Loggers

import Logger from "./logger.ts";

/**
 * @class FileLogger
 * This logger allows you to log messages to a file.
 */
export default class FileLogger extends Logger {

  /**
   * The file this logger will write log messages to.
   *
   * @property string file
   */
  protected file: string;

  /**
   * Construct an object of this class.
   *
   * @param any configs
   *     See Drash.Loggers.Logger.configs
   *
   */
  constructor(configs) {
    super(configs);
    this.file = configs.file;
  }

  /**
   * Write a log message to `this.file`.
   */
  public write(logMethodLevelDefinition, message): string {
    const encoder = new TextEncoder();
    let encoded = encoder.encode(message + "\n");
    Deno.writeFileSync(this.file, encoded, { append: true });
    return message;
  }
}
