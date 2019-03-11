import Logger from "./logger.ts";

export default class ConsoleLogger extends Logger {
  constructor(configs) {
    super(configs);
    super.type = Logger.TYPE_CONSOLE;
  }

  public write(logMethodLevelDefinition, message): string {
    console.log(message);
    return message; // return the message for testing purposes
  }
}
