import { HTTPError } from "../../../../../../../../src/standard/errors/HTTPError.ts";
import { StatusCode } from "../../../../../../../../src/standard/http/response/StatusCode.ts";
import { StatusDescription } from "../../../../../../../../src/standard/http/response/StatusDescription.ts";
import * as Chain from "../../../../../../../../src/modules/RequestChain/mod.native.ts";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

type WebAPIContext = {
  url: string;
  method: string;
  request: Request;
  response?: Response;
};

class Home extends Chain.Resource {
  public paths = ["/"];

  public GET(context: WebAPIContext) {
    context.response = new Response("Hello from GET.");
    return context;
  }

  public POST(context: WebAPIContext) {
    context.response = new Response("Hello from POST.");
    return context;
  }

  public DELETE(_context: WebAPIContext) {
    throw new Error("Hey, I'm the DELETE endpoint. Errrr.");
  }

  public PATCH(_context: WebAPIContext) {
    throw new HTTPError(405);
  }
}

const chain = Chain
  .builder()
  // .logger(GroupConsoleLogger.create("Test", Level.Off)) // TODO(crookse)
  .resources(Home)
  .build<WebAPIContext, WebAPIContext>();

export const handleRequest = (
  request: Request,
): Promise<Response> => {
  // We will keep the Request intact and provide url and method to let the chain
  // know how to route the request
  const context = {
    request,
    url: request.url,
    method: request.method,
  };

  return chain
    .handle(context)
    // Since we are passing in a context and resources are returning the
    // context, then we expect to retrieve a Response object from the context to
    // use as the Response
    .then((returnedContext) => {
      if (returnedContext.response) {
        return returnedContext.response;
      }

      return new Response(
        "Response not generated",
        {
          status: StatusCode.InternalServerError,
          statusText: StatusDescription.InternalServerError,
        },
      );
    })
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
