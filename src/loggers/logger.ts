import Drash from "../../mod.ts";

export default abstract class Logger {
  static TYPE_CONSOLE = 1;
  static TYPE_FILE = 2;

  protected current_log_message_level_name: string;
  protected type: number;
  protected level;
  protected level_definition;
  protected log_levels = Drash.Dictionaries.LogLevels;
  protected configs = {
    enabled: false,
    level: "debug"
  };
  protected tag_string: string;
  protected tag_string_fns: any;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  constructor(configs: any) {
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

  // FILE MARKER: METHODS - ABSTRACT ///////////////////////////////////////////////////////////////

  abstract write(logMethodLevelDefinition, message);

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////////////////////////

  /**
   * Output a DEBUG level log message.
   *
   * @param {String} message
   *     The log message to write.
   * @param {mixed} object
   *     If an object is passed, then output it on the next line after the message. This ensures
   *     that the object is written to the log as is and not as a string (unless it's a string).
   */
  public debug(message) {
    this.beforeLog(this.log_levels.debug, message);
  }

  /**
   * Output an ERROR level log message.
   *
   * @param {String} message
   *     The log message to write.
   * @param {mixed} object
   *     If an object is passed, then output it on the next line after the message. This ensures
   *     that the object is written to the log as is and not as a string (unless it's a string).
   */
  public error(message) {
    this.beforeLog(this.log_levels.error, message);
  }

  /**
   * Output a FATAL level log message.
   *
   * @param {String} message
   *     The log message to write.
   * @param {mixed} object
   *     If an object is passed, then output it on the next line after the message. This ensures
   *     that the object is written to the log as is and not as a string (unless it's a string).
   */
  public fatal(message) {
    this.beforeLog(this.log_levels.fatal, message);
  }

  /**
   * Output an INFO level log message.
   *
   * @param {String} message
   *     The log message to write.
   * @param {mixed} object
   *     If an object is passed, then output it on the next line after the message. This ensures
   *     that the object is written to the log as is and not as a string (unless it's a string).
   */
  public info(message) {
    this.beforeLog(this.log_levels.info, message);
  }

  /**
   * Output a TRACE level log message.
   *
   * @param {String} message
   *     The log message to write.
   * @param {mixed} object
   *     If an object is passed, then output it on the next line after the message. This ensures
   *     that the object is written to the log as is and not as a string (unless it's a string).
   */
  public trace(message) {
    this.beforeLog(this.log_levels.trace, message);
  }

  /**
   * Output a WARN level log message.
   *
   * @param {String} message
   *     The log message to write.
   * @param {mixed} object
   *     If an object is passed, then output it on the next line after the message. This ensures
   *     that the object is written to the log as is and not as a string (unless it's a string).
   */
  public warn(message) {
    this.beforeLog(this.log_levels.warn, message);
  }

  public beforeLog(logMethodLevelDefinition, message) {
    if (!this.configs.enabled) {
      return;
    }

    if (!this.log_levels[this.configs.level]) {
      return;
    }

    if (logMethodLevelDefinition.rank > this.level_definition.rank) {
      return;
    }

    this.current_log_message_level_name = logMethodLevelDefinition.name;

    this.write(logMethodLevelDefinition, this.getTagStringParsed() + message);
  }

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////////////////////////

  protected getTagStringParsed(): string {
    if (this.tag_string.trim() == "") {
      return "";
    }

    let tagString = this.tag_string;

    try {
      tagString = tagString.replace('{level}', this.current_log_message_level_name);
    } catch (error) {
      // ha... do nothing
    }

    for (let key in this.tag_string_fns) {// eslint-disable-line
      let tag = `{${key}}`;
      tagString = tagString.replace(tag, this.tag_string_fns[key]);
    }

    return tagString + " "; // Add a space so the log message isn't up against the tag string
  }
}
