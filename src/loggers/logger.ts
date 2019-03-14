// namespace Drash.Loggers

import Drash from "../../mod.ts";

export default abstract class Logger {
  static TYPE_CONSOLE = 1;
  static TYPE_FILE = 2;

  protected configs = {
    enabled: false,
    level: "debug"
  };
  protected current_log_message_level_name: string;
  protected type: number;
  protected level_definition: any;
  protected log_levels = Drash.Dictionaries.LogLevels;
  protected tag_string: string;
  protected tag_string_fns: any;
  protected test: boolean = false;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  constructor(configs: any) {
    if (configs.test === true) {
      this.test = true;
    }

    if (configs.enabled !== true) {
      configs.enabled = this.configs.enabled;
    }

    if (!this.log_levels[configs.level]) {
      configs.level = this.configs.level;
    }

    if (configs.tag_string) {
      this.tag_string = configs.tag_string;
    }

    if (configs.tag_string_fns) {
      this.tag_string_fns = configs.tag_string_fns;
    }

    this.configs = configs;

    this.level_definition = this.log_levels[this.configs.level];
  }

  // FILE MARKER: METHODS - ABSTRACT ///////////////////////////////////////////

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
    if (this.tag_string && this.tag_string.trim() == "") {
      return "";
    }

    let tagString = this.tag_string;

    try {
      tagString = tagString.replace(
        "{level}",
        this.current_log_message_level_name
      );
    } catch (error) {
      // ha... do nothing
    }

    for (let key in this.tag_string_fns) {
      // eslint-disable-line
      let tag = `{${key}}`;
      tagString = tagString.replace(tag, this.tag_string_fns[key]);
    }

    // Add a space so the log message isn't up against the tag string
    return tagString + " ";
  }

  /**
   * Send the message to the write method (which should be in the child class).
   * Also, do some prechecks before sending.
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
    if (logMethodLevelDefinition.rank > this.level_definition.rank) {
      return;
    }

    this.current_log_message_level_name = logMethodLevelDefinition.name;

    return this.write(
      logMethodLevelDefinition,
      this.getTagStringParsed() + message
    );
  }
}
