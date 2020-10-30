/**
 * Throw semantic errors related to configuration settings.
 */
export class ConfigsException extends Error {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param message - (optional) The exception message.
   */
  constructor(message: string = "Config is missing or invalid.") {
    super(message);
  }
}
