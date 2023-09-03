import { HTTPError } from "../../../../../../../../src/core/errors/HTTPError.ts";
import * as Chain from "../../../../../../../../src/modules/RequestChain/mod.native.ts";
import { StatusCode } from "../../../../../../../../src/core/http/response/StatusCode.ts";
import { StatusDescription } from "../../../../../../../../src/core/http/response/StatusDescription.ts";
import { ResourceGroup } from "../../../../../../../../src/standard/http/ResourceGroup.ts";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

class Home extends Chain.Resource {
  public paths = ["/home"];

  public GET(_request: Request) {
    return new Response("Hello from GET.");
  }

  public POST(_request: Request) {
    return new Response("Hello from POST.");
  }

  public DELETE(_request: Request) {
    throw new Error("Hey, I'm the DELETE endpoint. Errrr.");
  }

  public PATCH(_request: Request) {
    throw new HTTPError(405);
  }
}

class Users extends Chain.Resource {
  public paths = ["/users"];

  public GET(_request: Request) {
    return new Response("Hello from GET.");
  }

  public POST(_request: Request) {
    return new Response("Hello from POST.");
  }

  public DELETE(_request: Request) {
    throw new Error("Hey, I'm the DELETE endpoint. Errrr.");
  }

  public PATCH(_request: Request) {
    throw new HTTPError(405);
  }
}

class MiddlewareBlockedMethods extends Chain.Middleware {
  public GET(_request: Request) {
    return new Response("Blocked");
  }

  public POST(_request: Request) {
    return new Response("Blocked");
  }

  public DELETE(_request: Request) {
    return new Response("Blocked", { status: 500 });
  }

  public PATCH(_request: Request) {
    return new Response("Blocked", { status: 405 });
  }

  public PUT(_request: Request) {
    return new Response("Blocked", { status: 501 });
  }
}

class MiddlewareAll extends Chain.Middleware {
  public ALL(_request: Request) {
    return new Response("Alllllll that", { status: StatusCode.Created });
  }
}

const groupWithBlockedMethods = ResourceGroup
  .builder()
  .resources(Home)
  .withPathPrefixes("/api/v1")
  .withMiddleware(
    MiddlewareBlockedMethods,
  )
  .build();

const groupWithAll = ResourceGroup
  .builder()
  .resources(Users)
  .withPathPrefixes("/api/v2")
  .withMiddleware(
    MiddlewareAll,
  )
  .build();

const chain = Chain
  .builder()
  .resources(
    groupWithBlockedMethods,
    groupWithAll,
  )
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
        return new Response(error.message, {
          status: error.status_code,
          statusText: error.status_code_description,
        });
      }

      return new Response(error.message, {
        status: StatusCode.InternalServerError,
        statusText: StatusDescription.InternalServerError,
      });
    });
};
