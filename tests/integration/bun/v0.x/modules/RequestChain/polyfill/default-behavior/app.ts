import { HTTPError } from "../../../../../../../../.drashland/lib/esm/standard/errors/HTTPError";
import { StatusCode } from "../../../../../../../../.drashland/lib/esm/standard/http/response/StatusCode";
import { StatusDescription } from "../../../../../../../../.drashland/lib/esm/standard/http/response/StatusDescription";
import * as Chain from "../../../../../../../../.drashland/lib/esm/modules/RequestChain/mod.polyfill";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

class Home extends Chain.Resource {
  public paths = ["/"];

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

const chain = Chain
  .builder()
  // .logger(GroupConsoleLogger.create("Test", Level.Off)) // TODO(crookse)
  .resources(Home)
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
