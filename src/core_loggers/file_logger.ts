import type { Drash } from "../../mod.ts";
import { encoder } from "../../deps.ts";
import { Logger } from "./logger.ts";

/**
 * This logger allows you to log messages to a file.
 */
export class FileLogger extends Logger {
  /**
   * The file this logger will write log messages to.
   */
  protected file: string = "tmp_log.log";

  /**
   * Construct an object of this class.
   *
   * @param configs - Config used for Logging
   */
  constructor(configs: Drash.Interfaces.LoggerConfigs) {
    super(configs);
    if (configs.file) {
      this.file = configs.file;
    }
  }

  /**
   * Write a log message to this.file.
   *
   * This method is not intended to be called directly. It is already used
   * in the base class (Logger) and automatically called.
   *
   * @param logMethodLevelDefinition - Method to be Logged
   * @param message - The message to be logged
   *
   * @returns Returns the log message which is used for unit testing purposes. Returns void since this logger just writes to a file.
   */
  public write(
    logMethodLevelDefinition: Drash.Interfaces.LogLevelStructure,
    message: string,
  ): string | void {
    const encoder = new TextEncoder();
    let encoded = encoder.encode(message + "\n");
    if (this.test) {
      return message;
    }
    Deno.writeFileSync(this.file, encoded, { append: true });
  }
}
