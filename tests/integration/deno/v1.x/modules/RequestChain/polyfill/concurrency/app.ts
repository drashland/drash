import { HTTPError } from "../../../../../../../../src/standard/errors/HTTPError.ts";
import { StatusCode } from "../../../../../../../../src/standard/http/response/StatusCode.ts";
import { StatusDescription } from "../../../../../../../../src/standard/http/response/StatusDescription.ts";
import * as Chain from "../../../../../../../../src/modules/RequestChain/mod.polyfill.ts";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

class Accounts extends Chain.Resource {
  public paths = ["/accounts"];

  public GET(request: Request) {
    if (request.headers.get("x-wait-1")) {
      return new Promise((resolve) => {
          setTimeout(() => {
            resolve(new Response(
              "Waited for x-wait-1!",
              { status: 200 }
            ));
        }, 10000);
      });
    }

    if (request.headers.get("x-wait-2")) {
      return new Promise((resolve) => {
          setTimeout(() => {
            resolve(new Response(
              "Waited for x-wait-2!",
              { status: 200 }
            ));
        }, 1000);
      });
    }

    if (request.headers.get("x-wait-3")) {
      return new Promise((resolve) => {
          setTimeout(() => {
            resolve(new Response(
              "Waited for x-wait-3!",
              { status: 200 }
            ));
        }, 1000);
      });
    }

    return new Response(
      "Hello from Accounts.GET(). Didn't wait!",
      { status: 200 }
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
        "code" in error &&
        "code_description" in error
      ) {
        return new Response(error.message, {
          status: error.code,
          statusText: error.code_description,
        });
      }

      return new Response(error.message, {
        status: StatusCode.InternalServerError,
        statusText: StatusDescription.InternalServerError,
      });
    });
};

import { serve } from "https://deno.land/std@0.200.0/http/server.ts";

const handler = (request: Request): Promise<Response> => {
  return handleRequest(request)
};

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`);
await serve(handler, { port });