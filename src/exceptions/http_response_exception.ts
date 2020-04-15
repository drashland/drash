/**
 * @memberof Drash.Exceptions
 * @class HttpResponseException
 *
 * @description
 *     This class gives you a way to throw HTTP errors semantically in the
 *     response class. The difference between this class and HttpException
 *     comes when you want to check which exception was thrown via
 *     exception.constructor.name.
 */
export class HttpResponseException extends Error {
  /**
   * @description
   *     A property to hold the HTTP response code associated with this
   *     exception.
   *
   * @property number code
   */
  public code: number;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * @description
   *     Construct an object of this class.
   *
   * @param number code
   *     The HTTP response code associated with this exception.
   * @param string message
   *     (optional) The exception message.
   */
  constructor(code: number, message?: string) {
    super(message);
    this.code = code;
  }
}
