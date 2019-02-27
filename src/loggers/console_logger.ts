import Logger from "./logger.ts";

export default class ConsoleLogger extends Logger {
  constructor(configs) {
    super(configs);
    super.type = Logger.TYPE_CONSOLE;
  }
}
