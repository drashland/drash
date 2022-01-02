import { IExceptionLayer, Errors, Response } from "../../mod.ts";

export class ExceptionLayer implements IExceptionLayer {
  public catch(
    error: Errors.HttpError,
    _request: Request,
    response: Response
  ): void {
    response.status = error.code;
    response.text(error.stack ?? "Error: Unknown Error");
  }
}
