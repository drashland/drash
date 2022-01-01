import { Errors, Response, Service } from "../../../mod.ts";

export class ErrorsToJsonService extends Service {
    runOnError(error: Errors.HttpError, response: Response): Response {
        response.status = error.code;
        response.json(error);
        return response;
    }
}
