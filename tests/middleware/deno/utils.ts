import { HTTPError } from "../../../src/core/errors/HTTPError.ts";
import { StatusCode } from "../../../src/core/http/response/StatusCode.ts";
import { StatusDescription } from "../../../src/core/http/response/StatusDescription.ts";

export function catchError(error: Error | HTTPError): Response {
  if (
    (error.name === "HTTPError" || error instanceof HTTPError) &&
    "status_code" in error &&
    "status_code_description" in error
  ) {
    return new Response(error.message, {
      status: error.status_code,
      statusText: error.status_code_description,
    });
  }

  return new Response(error.message, {
    status: StatusCode.InternalServerError,
    statusText: StatusDescription.InternalServerError,
  });
}