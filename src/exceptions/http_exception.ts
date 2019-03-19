// namespace Drash.Exceptions

/**
 * @class HttpException
 * This class helps you throw HTTP errors in a semantic way.
 */
export default class HttpException extends Error {
  public code: number;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param number code
   *     The code to associate this error with. This should be a valid HTTP
   *     status code.
   * @param string message
   *     The error message.
   */
  constructor(code: number, message?: string) {
    super(message);
    this.code = code;
  }
}
