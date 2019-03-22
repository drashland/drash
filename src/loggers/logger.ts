// namespace Drash.Loggers

import Drash from "../../mod.ts";
import LogLevels from "../dictionaries/log_levels.ts";

/**
 * @class Logger
 * This logger is the base logger class for all logger classes.
 */
export default abstract class Logger {
  static TYPE_CONSOLE = 1;
  static TYPE_FILE = 2;

  /**
   * This logger's configs. See example code below.
   *
   * @examplecode [
   *   {
   *     "title": "Logger Configs",
   *     "filepath": "/api-reference/loggers/logger_p_configs.ts",
   *     "language": "text"
   *   }
   * ]
   */
  protected configs: any;
  protected current_log_message_level_name: string;
  protected log_levels = LogLevels;
  protected test: boolean = false;
  protected type: number;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param any configs
   *     See [Drash.Loggers.Logger.configs](/#/api-reference/loggers/logger#configs).
   */
  constructor(configs: any) {
    if (configs.test === true) {
      this.test = true;
    }

    if (configs.enabled !== true) {
      configs.enabled = false;
    }

    if (!this.log_levels.hasOwnProperty(configs.level)) {
      configs.level = "debug";
    }
    configs.level_definition = this.log_levels[configs.level];

    if (!configs.tag_string) {
      configs.tag_string = "";
    }

    if (!configs.tag_string_fns) {
      configs.tag_string_fns = {};
    }

    this.configs = configs;
  }

  // FILE MARKER: METHODS - ABSTRACT ///////////////////////////////////////////

  /**
   * Write a log message.
   */
  abstract write(logMethodLevelDefinition, message);

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////

  /**
   * Output a DEBUG level log message.
   *
   * @param string message
   *     The log message.
   */
  public debug(message) {
    return this.sendToWriteMethod(this.log_levels.debug, message);
  }

  /**
   * Output an ERROR level log message.
   *
   * @param string message
   *     The log message.
   */
  public error(message) {
    return this.sendToWriteMethod(this.log_levels.error, message);
  }

  /**
   * Output a FATAL level log message.
   *
   * @param string message
   *     The log message.
   */
  public fatal(message) {
    return this.sendToWriteMethod(this.log_levels.fatal, message);
  }

  /**
   * Output an INFO level log message.
   *
   * @param string message
   *     The log message.
   */
  public info(message) {
    return this.sendToWriteMethod(this.log_levels.info, message);
  }

  /**
   * Output a TRACE level log message.
   *
   * @param string message
   *     The log message.
   */
  public trace(message) {
    return this.sendToWriteMethod(this.log_levels.trace, message);
  }

  /**
   * Output a WARN level log message.
   *
   * @param string message
   *     The log message.
   */
  public warn(message) {
    return this.sendToWriteMethod(this.log_levels.warn, message);
  }

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////

  /**
   * Get the parsed version of the raw tag string.
   *
   * @return string
   */
  protected getTagStringParsed(): string {
    if (this.configs.tag_string.trim() == "") {
      return "";
    }

    let tagString = this.configs.tag_string;

    try {
      tagString = tagString.replace(
        "{level}",
        this.current_log_message_level_name
      );
    } catch (error) {
      // ha... do nothing
    }

    for (let key in this.configs.tag_string_fns) {
      let tag = `{${key}}`;
      tagString = tagString.replace(tag, this.configs.tag_string_fns[key]);
    }

    // Add a space so the log message isn't up against the tag string
    return tagString + " ";
  }

  /**
   * Send the message to the write method (which should be in the child class).
   * Also, do some prechecks before sending to see if the log message should be
   * written.
   *
   * @param any logMethodLevelDefinition
   *     The dictionary definition of the log message's level.
   * @param string message
   *     The log message.
   *
   * @return void
   */
  protected sendToWriteMethod(logMethodLevelDefinition, message) {
    // Logger not enabled? Womp womp...
    if (!this.configs.enabled) {
      return;
    }

    // Log level specified in the configs doesn't exist? Womp womp...
    if (!this.log_levels[this.configs.level]) {
      return;
    }

    // We only want to output messages that have a lower rank than the specified
    // level in the configs. This ensures that we only show the least amount of
    // log messages as specified by the user. For example, if the user only
    // wants to output FATAL log messages (has a rank of 400), then any log
    // message with a rank greater than that (ERROR, WARN, INFO, DEBUG, TRACE)
    // will NOT be processed.
    if (logMethodLevelDefinition.rank > this.configs.level_definition.rank) {
      return;
    }

    this.current_log_message_level_name = logMethodLevelDefinition.name;

    return this.write(
      logMethodLevelDefinition,
      this.getTagStringParsed() + message
    );
  }
}
