import { Drash } from "../../mod.ts";
import { Logger } from "./logger.ts";

/**
 * @memberof Drash.CoreLoggers
 * @class ConsoleLogger
 *
 * @description
 *     This logger allows you to log messages to the console.
 */
export class ConsoleLogger extends Logger {
  /**
   * @description
   *     Construct an object of this class.
   *
   * @param any configs
   *     See Drash.Interfaces.LoggerConfigs.
   */
  constructor(configs: Drash.Interfaces.LoggerConfigs) {
    super(configs);
  }

  /**
   * @description
   *     Write a log message to the console.
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
  public write(logMethodLevelDefinition: any, message: string): string | void {
    if (this.test) {
      return message;
    }

    console.log(message);
  }
}
