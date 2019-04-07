import Drash from "../../mod.ts";
import LogLevels from "../dictionaries/log_levels.ts";

/**
 * @memberof Drash.Loggers
 * @class Logger
 *
 * @description
 *     This logger is the base logger class for all logger classes.
 */
export default abstract class Logger {
  /**
   * @description
   *     This logger's configs.
   *     ```javascript
   *     {
   *       //
   *       // enabled: boolean
   *       //
   *       //     OPTIONS/VALUE
   *       //         true, false
   *       //
   *       //     DEFAULT VALUE
   *       //         false
   *       //
   *       //     DESCRIPTION
   *       //         Is the logger enabled?
   *       //
   *       enabled: true,
   *       //
   *       // level: string
   *       //
   *       //     OPTIONS/VALUE
   *       //         all, trace, debug, info, warn, error, fatal, off
   *       //
   *       //     DEFAULT VALUE
   *       //         debug
   *       //
   *       //     DESCRIPTION
   *       //         Control the number of messages logged by the logger.
   *       //
   *       level: "debug",
   *       //
   *       // tag_string: string
   *       //
   *       //    OPTIONS/VALUE
   *       //         This only takes a string with tags formatted as {tag}. Example:
   *       //
   *       //             {this_tag} | {that_tag} | {another_tag}
   *       //             {this_tag} * {that_tag} * {another_tag}
   *       //             [{this_tag}] [{that_tag}] [{another_tag}]
   *       //
   *       //     DEFAULT VALUE
   *       //         None.
   *       //
   *       //     DESCRIPTION
   *       //         This tag string will be parsed by the logger object and tags will
   *       //         be replaced based on the `tag_string_fns` config.
   *       //
   *       tag_string: "",
   *       //
   *       // tag_string_fns: any
   *       //
   *       //     OPTIONS/VALUE
   *       //         This takes an object of key-value pairs where the key is the name
   *       //         of a tag defined in the `tag_string` config.
   *       //
   *       //     DEFAULT VALUE
   *       //         None.
   *       //
   *       //     DESCRIPTION
   *       //         This object is used to replace tags in the `tag_string` config by
   *       //         matching keys to tags and replacing tags with the values of the
   *       //         keys. For example, if the `tag_string` and `tag_string_fns` configs
   *       //         were ...
   *       //
   *       //             {
   *       //               enabled: true,
   *       //               level: "debug",
   *       //               tag_string: "[ - {datetime} - ] {your_tag} === {level} ==="
   *       //               tag_string_fns: {
   *       //                 datetime: function datetime() {
   *       //                   let dateTime = new Date();
   *       //                   dateTime.setUTCHours(dateTime.getUTCHours() - 5);
   *       //                   return dateTime.toISOString().replace("T", " ");
   *       //                 },
   *       //                 your_tag: "This-Is-Your-Tag"
   *       //               }
   *       //             }
   *       //
   *       //         ... then the tags string would output something like ...
   *       //
   *       //             [ - 2018-08-26 00:10:02.590Z - ] This-Is-Your-Tag === DEBUG === {log message would be appended here}
   *       //
   *       //         The {level} tag is reserved and cannot be defined. It is replaced
   *       //         with the level of the current log message being written. For
   *       //         example, if `MyLogger.info("some message")` is called, then the
   *       //         {level} tag will be replaced with INFO.
   *       //
   *       tag_string_fns: {},
   *     }
   *     ```
   *
   * @property any configs
   */
  protected configs: any;

  /**
   * @description
   *     The level of the log message currently being written.
   *
   * @property string current_log_message_level_name
   */
  protected current_log_message_level_name: string;

  /**
   * @doc-blocks-to-json ignore-doc-block
   */
  protected test: boolean = false;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * @description
   *     Construct an object of this class.
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

    configs.level = configs.level
      ? configs.level.toLowerCase()
      : "debug";
    if (!LogLevels.get(configs.level)) {
      configs.level = "debug";
    }

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
   * @description
   *     Write a log message.
   *
   * @param any logMethodLevelDefinition
   * @param string message
   */
  abstract write(logMethodLevelDefinition, message);

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////

  /**
   * @description
   *     Output a DEBUG level log message.
   *
   * @param string message
   *     The log message.
   */
  public debug(message) {
    return this.sendToWriteMethod(LogLevels.get("debug"), message);
  }

  /**
   * @description
   *     Output an ERROR level log message.
   *
   * @param string message
   *     The log message.
   */
  public error(message) {
    return this.sendToWriteMethod(LogLevels.get("error"), message);
  }

  /**
   * @description
   *     Output a FATAL level log message.
   *
   * @param string message
   *     The log message.
   */
  public fatal(message) {
    return this.sendToWriteMethod(LogLevels.get("fatal"), message);
  }

  /**
   * @description
   *     Output an INFO level log message.
   *
   * @param string message
   *     The log message.
   */
  public info(message) {
    return this.sendToWriteMethod(LogLevels.get("info"), message);
  }

  /**
   * @description
   *     Output a TRACE level log message.
   *
   * @param string message
   *     The log message.
   */
  public trace(message) {
    return this.sendToWriteMethod(LogLevels.get("trace"), message);
  }

  /**
   * @description
   *     Output a WARN level log message.
   *
   * @param string message
   *     The log message.
   */
  public warn(message) {
    return this.sendToWriteMethod(LogLevels.get("warn"), message);
  }

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////

  /**
   * @description
   *     Get the parsed version of the raw tag string.
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
   * @description
   *     Send the message to the write method (which should be in the child
   *     class).  Also, do some prechecks before sending to see if the log
   *     message should be written.
   *
   * @param any logMethodLevelDefinition
   *     The dictionary definition of the log message's level.
   * @param string message
   *     The log message.
   *
   * @return string
   *     Returns the log message which is used for unit testing purposes.
   */
  protected sendToWriteMethod(logMethodLevelDefinition, message): string {
    // Logger not enabled? Womp womp...
    if (!this.configs.enabled) {
      return;
    }

    // Log level specified in the configs doesn't exist? Womp womp...
    if (!LogLevels.get(this.configs.level)) {
      return;
    }

    // We only want to output messages that have a lower rank than the specified
    // level in the configs. This ensures that we only show the least amount of
    // log messages as specified by the user. For example, if the user only
    // wants to output FATAL log messages (has a rank of 400), then any log
    // message with a rank greater than that (ERROR, WARN, INFO, DEBUG, TRACE)
    // will NOT be processed.
    if (logMethodLevelDefinition.rank > LogLevels.get(this.configs.level).rank) {
      return;
    }

    this.current_log_message_level_name = logMethodLevelDefinition.name.toUpperCase();

    return this.write(
      logMethodLevelDefinition,
      this.getTagStringParsed() + message
    );
  }
}
