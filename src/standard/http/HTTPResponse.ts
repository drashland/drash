import { StatusCode as StatusCodeEnum } from "../../core/http/response/StatusCode.ts";
import { HTTPError } from "../errors/HTTPError.ts";
import { StatusByCode } from "./response/StatusByCode.ts";

class HTTPResponse {
  static error(
    statusCode: StatusCodeEnum | number,
    message?: string,
  ): HTTPError {
    return new HTTPError(statusCode, message);
  }

  static fromStatusCode(statusCode: StatusCodeEnum | number): Response {
    const status = StatusByCode[statusCode];

    return new Response(status.Description, {
      status: status.Code,
      statusText: status.Description,
    });
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { HTTPResponse };
