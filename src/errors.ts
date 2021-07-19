import * as Drash from "../mod.ts";

/**
 * This class is for throwing Drash-related errors.
 */
export class DrashError extends Error {
  /**
   * Construct an object of this class.
   *
   * @param code - See DRASH_ERROR_CODES array in this file.
   */
  constructor(code: string) {
    super(`[${code}] ${DRASH_ERROR_CODES[code]}`);
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
    if (!message) {
      const statusText = Drash.Deps.STATUS_TEXT.get(code);
      if (statusText) {
        this.message = statusText;
      }
    }
    this.code = code;
  }
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - ERROR CODES ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const DRASH_ERROR_CODES: { [k: string]: string } = {
  "D1000": "Resource 'paths' property must be an array of strings.",
  "D1001": "Resource 'paths' property is missing.",
};
