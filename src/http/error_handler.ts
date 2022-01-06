import { Errors, IErrorHandler, Response } from "../../mod.ts";

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
  ): void {
    if (error instanceof Errors.HttpError) {
      response.status = error.code;
    } else {
      response.status = 500;
    }
    response.text(error.stack ?? "Error: Unknown Error");
  }
}
