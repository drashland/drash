import { HTTPError } from "../../../../../../../../src/standard/errors/HTTPError.ts";
import { StatusCode } from "../../../../../../../../src/core/http/response/StatusCode.ts";
import { StatusDescription } from "../../../../../../../../src/standard/http/response/StatusDescription.ts";
import * as Chain from "../../../../../../../../src/modules/RequestChain/mod.native.ts";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

class Accounts extends Chain.Resource {
  public paths = ["/accounts"];

  public GET(request: Request) {
    if (request.headers.get("x-wait-1")) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            new Response(
              "Waited for x-wait-1!",
              { status: 200 },
            ),
          );
        }, 2000);
      });
    }

    if (request.headers.get("x-wait-2")) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            new Response(
              "Waited for x-wait-2!",
              { status: 200 },
            ),
          );
        }, 1500);
      });
    }

    if (request.headers.get("x-wait-3")) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            new Response(
              "Waited for x-wait-3!",
              { status: 200 },
            ),
          );
        }, 1250);
      });
    }

    return new Response(
      "Hello from Accounts.GET(). Didn't wait!",
      { status: 200 },
    );
  }
}

class Users extends Chain.Resource {
  public paths = ["/users"];

  public GET(_request: Request) {
    throw new HTTPError(StatusCode.MethodNotAllowed);
  }
}

const chain = Chain
  .builder()
  .resources(Accounts, Users)
  .build<Request, Response>();

export const handleRequest = (
  request: Request,
): Promise<Response> => {
  return chain
    .handle(request)
    .catch((error: Error | HTTPError) => {
      if (
        (error.name === "HTTPError" || error instanceof HTTPError) &&
        "status_code" in error &&
        "status_code_description" in error
      ) {
        return new Response(`error.message: ${error.message}`, {
          status: error.status_code,
          statusText: error.status_code_description,
        });
      }

      return new Response(`error.message: ${error.message}`, {
        status: StatusCode.InternalServerError,
        statusText: StatusDescription.InternalServerError,
      });
    });
};
