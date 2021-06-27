/**
 * This class is for throwing errors related to resource paths.
 */
export class InvalidPathError extends Error {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param message - (optional) The exception message.
   */
  constructor(message: string = "Path must be a string.") {
    super(message);
  }
}
