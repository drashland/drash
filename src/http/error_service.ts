import { IErrorService, Errors, Response } from "../../mod.ts";

export class ErrorService implements IErrorService {
    public runAfterResource(
        error: Errors.HttpError,
        response: Response
    ): Response {
        response.status = error.code;
        response.text(error.stack ?? "Error: Unknown Error");
        return response;
    }
}
