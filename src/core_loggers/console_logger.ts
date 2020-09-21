import type { Drash } from "../../mod.ts";
import { Logger } from "./logger.ts";

/**
 * This logger allows you to log messages to the console.
 */
export class ConsoleLogger extends Logger {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param configs - Config used for Logging
   */
  constructor(configs: Drash.Interfaces.LoggerConfigs) {
    super(configs);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Write a log message to the console.
   *
   * This method is not intended to be called directly. It is already used
   * in the base class (Logger) and automatically called.
   *
   * @param logMethodLevelDefinition - Method to be Logged
   * @param message - The message to be logged
   *
   * @returns Returns the log message which is used for unit testing purposes. Returns void since the logger just logs to the console.
   */
  public write(
    logMethodLevelDefinition: Drash.Interfaces.LogLevelStructure,
    message: string,
  ): string | void {
    if (this.test) {
      return message;
    }

    console.log(message);
  }
}
