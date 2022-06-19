import { Errors, IErrorHandler, Response } from "../../mod.ts";
import { STATUS_TEXT } from "../../deps.ts";
import type { ConnInfo } from "../../deps.ts";

export class ErrorHandler implements IErrorHandler {
  /**
   * Catch and handle the given error.
   *
   * @param error - The Error object that is thrown during runtime.
   * @param request - The original request that threw the error. Note this is
   * not that `Drash.Request` object. Reason being, the `Drash.Request` object
   * can also throw an error and would not be available as a parameter.
   * @param response - The `Drash.Response` object.
   */
  public catch(
    error: Error,
    _request: Request,
    response: Response,
    _connInfo: ConnInfo,
  ): void {
    const errorMessage = error.stack ?? "Error: Unknown Error";

    // Built-in Drash HTTP error object? Use the error code as the HTTP status
    // code. The error code is always in the range of HTTP status codes.
    if (error instanceof Errors.HttpError) {
      return response.text(errorMessage, error.code);
    }

    // No code? Default to 500.
    if (!("code" in error)) {
      return response.text(errorMessage, 500);
    }

    // If the error has a code, then we need to make sure it is within the range
    // of HTTP status codes. Otherwise, we cannot convert this to a response.
    if ("code" in error) {
      const errorWithCode = error as unknown as { code: unknown };

      // Start off with 500 as the default
      let code = 500;

      // Status codes should be a number. Not a string, not a boolean, etc. If
      // it is a number AND it is within the range of HTTP status codes, then we
      // replace the default 500 with it.
      if (
        typeof errorWithCode.code === "number" &&
        STATUS_TEXT.get(errorWithCode.code.toString())
      ) {
        code = errorWithCode.code;
      }
      return response.text(errorMessage, code);
    }

    return response.text(errorMessage);
  }
}
