/**
 * This class is for throwing errors during compile time.
 */
export class CompileError extends Error {
  /**
   * Construct an object of this class.
   *
   * @param code - See ERROR_CODES array in this file.
   */
  constructor(code: string) {
    super(`[${code}] ${ERROR_CODES[code]}`);
  }
}

/**
 * This class is for throwing errors in the request-resource-response lifecycle.
 */
export class HttpError extends Error {
  /**
   * A property to hold the HTTP response code associated with this
   * exception.
   */
  public code: number;

  /**
   * Construct an object of this class.
   *
   * @param code - See HttpError.code.
   * @param message - (optional) The exception message.
   */
  constructor(code: number, message?: string) {
    super(message);
    this.code = code;
  }
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - COMILE ERROR CODES ////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const ERROR_CODES: { [k: string]: string } = {
  "D1000": "Resource 'paths' property must be an array of strings.",
  "D1001": "Resource 'paths' property is missing.",
};
