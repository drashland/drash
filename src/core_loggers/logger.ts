import { Drash } from "../../mod.ts";

/**
 * This Logger is the base logger class for all logger classes.
 */
export abstract class Logger {
  /**
     * @param configs - Config used for Logging
     */
  protected configs: Drash.Interfaces.LoggerConfigs;

  /**
     * The level of the log message currently being written.
     */
  protected current_log_message_level_name: string = "";

  /**
     * @doc-blocks-to-json ignore-doc-block
     */
  protected test: boolean = false;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
     * Construct an object of this class.
     *
     * @param configs - Config used for Logging
     */
  constructor(configs: Drash.Interfaces.LoggerConfigs) {
    if (configs.test === true) {
      this.test = true;
    }

    if (configs.enabled !== true) {
      configs.enabled = false;
    }

    configs.level = configs.level ? configs.level.toLowerCase() : "debug";
    if (!Drash.Dictionaries.LogLevels.get(configs.level)) {
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

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - ABSTRACT //////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
     * Write a log message. All extended classes must implement this method.
     * See Drash.CoreLoggers.ConsoleLogger/FileLogger for examples.
     *
     * @param logMethodLevelDefinition - {@link ./interfaces/log_level_structures.ts#LogLevelStructure | Interface of Log}
     * @param message - The message to be logged
     *
     * @returns Return varies based on child class implementation.
     */
  abstract write(
    logMethodLevelDefinition: Drash.Interfaces.LogLevelStructure,
    message: string,
  ): string | void;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
     * Output a DEBUG level log message.
     *
     * @param message - The log message.
     */
  public debug(message: string): string | void {
    return this.sendToWriteMethod(
      Drash.Dictionaries.LogLevels.get("debug")!,
      message,
    );
  }

  /**
     * Output an ERROR level log message.
     *
     * @param message - The log message.
     */
  public error(message: string): string | void {
    return this.sendToWriteMethod(
      Drash.Dictionaries.LogLevels.get("error")!,
      message,
    );
  }

  /**
     * Output a FATAL level log message.
     *
     * @param message - The log message.
     */
  public fatal(message: string): string | void {
    return this.sendToWriteMethod(
      Drash.Dictionaries.LogLevels.get("fatal")!,
      message,
    );
  }

  /**
     * Output an INFO level log message.
     *
     * @param message - The log message.
     */
  public info(message: string): string | void {
    return this.sendToWriteMethod(
      Drash.Dictionaries.LogLevels.get("info")!,
      message,
    );
  }

  /**
     * Output a TRACE level log message.
     *
     * @param message - The log message.
     */
  public trace(message: string): string | void {
    return this.sendToWriteMethod(
      Drash.Dictionaries.LogLevels.get("trace")!,
      message,
    );
  }

  /**
     * Output a WARN level log message.
     *
     * @param message - The log message.
     */
  public warn(message: string): string | void {
    return this.sendToWriteMethod(
      Drash.Dictionaries.LogLevels.get("warn")!,
      message,
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
     * Get the parsed version of the raw tag string.
     *
     * @return The tag string
     */
  protected getTagStringParsed(): string {
    if (this.configs.tag_string && this.configs.tag_string.trim() == "") {
      return "";
    }

    let tagString = this.configs.tag_string;

    if (!tagString) {
      return "";
    }

    try {
      tagString = tagString.replace(
        "{level}",
        this.current_log_message_level_name,
      );
    } catch (error) {
      // ha... do nothing
    }

    for (let key in this.configs.tag_string_fns) {
      let tag = `{${key}}`;
      tagString = tagString.replace(
        tag,
        this.configs.tag_string_fns[key],
      );
    }

    // Add a space so the log message isn't up against the tag string
    return tagString + " ";
  }

  /**
     * Send the message to the write method (which should be in the child
     * class).  Also, do some prechecks before sending to see if the log
     * message should be written.
     *
     * @param logMethodLevelDefinition - {@link ./interfaces/log_level_structures.ts#LogLevelStructure | The dictionary definition of the log message's level.}
     *
     * @param message - The log message.
     *
     * @return Returns the log message which is used for unit testing purposes.
     */
  protected sendToWriteMethod(
    logMethodLevelDefinition: Drash.Interfaces.LogLevelStructure,
    message: string,
  ): string | void {
    // Logger not enabled? Womp womp...
    if (!this.configs.enabled) {
      return;
    }
    if (!this.configs.level) {
      return;
    }
    const key: string = this.configs.level ? this.configs.level : "";

    // We only want to output messages that have a lower rank than the specified
    // level in the configs. This ensures that we only show the least amount of
    // log messages as specified by the user. For example, if the user only
    // wants to output FATAL log messages (has a rank of 400), then any log
    // message with a rank greater than that (ERROR, WARN, INFO, DEBUG, TRACE)
    // will NOT be processed.
    const level = Drash.Dictionaries.LogLevels.get(key);
    if (!level) {
      return;
    }
    if (logMethodLevelDefinition.rank > level.rank) {
      return;
    }

    this.current_log_message_level_name = logMethodLevelDefinition.name
      .toUpperCase();

    return this.write(
      logMethodLevelDefinition,
      this.getTagStringParsed() + message,
    );
  }
}
