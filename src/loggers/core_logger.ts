import Logger from "./logger.ts";
import {colorize} from "../util/members.ts";

/**
 * @class CoreLogger
 * This logger allows Drash developers to log messages to the console within the
 * codebase.
 */
export default class CoreLogger extends Logger {

  protected enabled: boolean = false;
  protected test: boolean = false;

  /**
   * Construct an object of this class.
   */
  constructor(configs) {
    super(configs);
  }

  /**
   * @inheritdoc
   */
  public write(logMethodLevelDefinition, message): string {
    message = `[Drash] ${message}`;
    // We want to test that the message is what we expect, but not have it show
    // up in the console because that looks silly during tests
    if (this.test) {
      return message;
    }

    let color;

    switch (this.current_log_message_level_name.toLowerCase()) {
      case "debug":
        color = "green";
        break;
      case "error":
        color = "red";
        break;
      case "warn":
        color = "yellow";
        break;
      default:
        color = "default";
        break;
    }

    let colorizeOpts = {
      color: color
    };

    console.log(colorize(message, colorizeOpts));
  }
}
