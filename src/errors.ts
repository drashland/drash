import { STATUS_TEXT } from "../deps.ts";

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
      const statusText = STATUS_TEXT.get(code);
      if (statusText) {
        this.message = statusText;
      }
    }
    this.code = code;
  }
}
