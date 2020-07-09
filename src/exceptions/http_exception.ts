/**
 * This class gives you a way to throw HTTP errors semantically.
 */
export class HttpException extends Error {
  /**
   * A property to hold the HTTP response code associated with this
   * exception.
   */
  public code: number;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param code - The HTTP response code associated with this exception.
   * @param message - (optional) The exception message.
   */
  constructor(code: number, message?: string) {
    super(message);
    this.code = code;
  }
}
