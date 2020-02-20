import Logger from "./logger.ts";
import { LoggerConfigs } from "../interfaces/logger_configs.ts";

/**
 * @memberof Drash.CoreLoggers
 * @class FileLogger
 *
 * @description
 *     This logger allows you to log messages to a file.
 */
export default class FileLogger extends Logger {
  /**
   * @description
   *     The file this logger will write log messages to.
   *
   * @property string file
   */
  protected file: string;

  /**
   * @description
   *     Construct an object of this class.
   *
   * @param LoggerConfigs configs
   *     See Drash.Interfaces.LoggerConfigs.
   *
   */
  constructor(configs: LoggerConfigs) {
    super(configs);
    this.file = configs.file;
  }

  /**
   * @description
   *     Write a log message to this.file.
   *
   *     This method is not intended to be called directly. It is already used
   *     in the base class (Logger) and automatically called.
   *
   * @param any logMethodLevelDefinition
   * @param string message
   *
   * @return string
   *     Returns the log message which is used for unit testing purposes.
   */
  public write(logMethodLevelDefinition, message): string {
    const encoder = new TextEncoder();
    let encoded = encoder.encode(message + "\n");
    Deno.writeFileSync(this.file, encoded, { append: true });
    return message;
  }
}
