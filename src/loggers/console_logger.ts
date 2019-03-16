// namespace Drash.Loggers

import Logger from "./logger.ts";

/**
 * @class ConsoleLogger
 * This logger allows you to log messages to the console.
 */
export default class ConsoleLogger extends Logger {
  constructor(configs) {
    super(configs);
    super.type = Logger.TYPE_CONSOLE;
  }

  public write(logMethodLevelDefinition, message): string {
    if (this.test) {
      return message;
    }

    console.log(message);
  }
}
