import Drash from "../../mod.ts";

export default class Logger {
  static TYPE_CONSOLE = 1;
  static TYPE_FILE = 2;

  protected type: number;
  protected level;
  protected level_definition;
  protected log_levels = Drash.Dictionaries.LogLevels;
  protected configs = {
    enabled: false,
    level: "debug"
  };

  constructor(configs: any) {
    if (configs.enabled !== true) {
      configs.enabled = this.configs.enabled;
    }

    if (!this.log_levels[configs.level]) {
      configs.level = this.configs.level;
    }

    this.configs = configs;

    this.level_definition = this.log_levels[this.configs.level];
  }

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

    this.write(logMethodLevelDefinition, message);
  }

  public write(logMethodLevelDefinition, message) {
    switch (this.type) {
      case Logger.TYPE_CONSOLE:
        console.log(`${logMethodLevelDefinition.name} | ${message}`);
        break;
      default:
        break;
    }
  }
}
