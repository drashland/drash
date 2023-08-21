// Drash imports
import { HTTPError } from "@/.drashland/builds/esm/core/errors/HTTPError";
import { StatusByCode } from "@/.drashland/builds/esm/core/http/Status";
import * as Chain from "@/.drashland/builds/esm/modules/RequestChain/polyfill";

// Node imports
import { IncomingMessage, ServerResponse } from "node:http";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

class Home extends Chain.Resource {
  public paths = ["/"];

  public GET(request: Request) {
    return new Response("Hello from GET.");
  }

  public POST(request: Request) {
    return new Response("Hello from POST.");
  }

  public DELETE(request: Request) {
    throw new Error("Hey, I'm the DELETE endpoint. Errrr.");
  }

  public PATCH(request: Request) {
    throw new HTTPError(405);
  }
}

const chain = Chain
  .builder()
  .resources(Home)
  .build<Request, Response>();

export const send = (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {

  // Convert the IncomingMessage object to a Request object
  const request = new Request(`${protocol}://${hostname}:${port}${req.url}`, {
    method: req.method
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

      res.statusCode = StatusByCode[500].Code;
      res.statusMessage = StatusByCode[500].Description;
      res.end(error.message);
    });
};
