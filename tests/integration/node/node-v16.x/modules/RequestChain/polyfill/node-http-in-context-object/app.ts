import { IncomingMessage, ServerResponse } from "node:http";

import { HTTPError } from "../../../../../../../../.drashland/lib/esm/standard/errors/HTTPError";
import { StatusCode } from "../../../../../../../../.drashland/lib/esm/standard/http/response/StatusCode";
import { StatusDescription } from "../../../../../../../../.drashland/lib/esm/standard/http/response/StatusDescription";
import * as Chain from "../../../../../../../../.drashland/lib/esm/modules/RequestChain/polyfill";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

type NodeContext = {
  url: string;
  method: string;
  request: IncomingMessage;
  response: ServerResponse<IncomingMessage>;
};

class Home extends Chain.Resource {
  public paths = ["/"];

  public GET(context: NodeContext) {
    context.response.setHeader("x-drash", "Home.GET()");
    context.response.write("Hello from GET.");
    return context;
  }

  public POST(context: NodeContext) {
    context.response.setHeader("x-drash", "Home.POST()");
    context.response.write("Hello from POST.");
  }

  public DELETE(context: NodeContext) {
    context.response.setHeader("x-drash", "Home.DELETE()");
    throw new Error("Hey, I'm the DELETE endpoint. Errrr.");
  }

  public PATCH(context: NodeContext) {
    context.response.setHeader("x-drash", "Home.PATCH()");
    throw new HTTPError(405);
  }
}

const chain = Chain
  .builder()
  .resources(Home)
  // .logger(GroupConsoleLogger.create("Test", Level.Off)) TODO(crookse)
  .build<NodeContext, NodeContext>();

export const handleRequest = (
  request: IncomingMessage,
  response: ServerResponse,
): Promise<NodeContext> => {
  // We will keep the IncomingMessage and ServerResponse objects intact and just
  // provide url and method to let the chain know how to route the request
  const context = {
    url: `${protocol}://${hostname}:${port}${request.url}`,
    method: request.method,
    request,
    response,
  };

  return chain
    .handle(context)
    // There is no `.then((response) => { ... })` block here because resources
    // use `context.response.end()` which tells Node the ServerResponse ended
    .catch((error: Error | HTTPError) => {
      if (
        (error.name === "HTTPError" || error instanceof HTTPError) &&
        "code" in error &&
        "code_description" in error
      ) {
        context.response.statusCode = error.code;
        context.response.statusMessage = error.code_description;
        context.response.end(error.message);
      } else {
        context.response.statusCode = StatusCode.InternalServerError;
        context.response.statusMessage = StatusDescription.InternalServerError;
        context.response.end(error.message);
      }

      return context;
    });
};
