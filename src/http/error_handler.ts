import { IErrorHandler, Errors, Response } from "../../mod.ts";

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
    error: Errors.HttpError,
    _request: Request,
    response: Response
  ): void {
    response.status = error.code ?? 500;
    response.text(error.stack ?? "Error: Unknown Error");
  }
}
