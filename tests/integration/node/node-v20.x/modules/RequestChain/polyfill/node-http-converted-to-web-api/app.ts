import { IncomingMessage, ServerResponse } from "node:http";

import { HTTPError } from "../../../../../../../../.drashland/lib/esm/standard/errors/HTTPError";
import { StatusCode } from "../../../../../../../../.drashland/lib/esm/standard/http/response/StatusCode";
import { StatusDescription } from "../../../../../../../../.drashland/lib/esm/standard/http/response/StatusDescription";
import * as Chain from "../../../../../../../../.drashland/lib/esm/modules/RequestChain/polyfill";
// import {
//   GroupConsoleLogger,
//   Level,
// } from "../../../../../../../../.drashland/lib/esm/standard/log/GroupConsoleLogger";

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
  // .logger(GroupConsoleLogger.create("Test", Level.Off))
  .resources(Home)
  .build<Request, Response>();

export const handleRequest = (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  // Convert the IncomingMessage object to a Request object
  const request = new Request(`${protocol}://${hostname}:${port}${req.url}`, {
    method: req.method,
  });

  return chain
    .handle(request)
    // All resources will return a Response object that we can use to build the
    // ServerResponse object
    .then((response) => {
      res.statusCode = response.status;
      return response.text();
    })
    .then((body) => {
      res.end(body);
    })
    .catch((error: Error | HTTPError) => {
      if (
        (error.name === "HTTPError" || error instanceof HTTPError) &&
        "code" in error &&
        "code_description" in error
      ) {
        res.statusCode = error.code;
        res.statusMessage = error.code_description;
        res.end(error.message);
        return;
      }

      res.statusCode = StatusCode.InternalServerError;
      res.statusMessage = StatusDescription.InternalServerError;
      res.end(error.message);
    });
};
