// Drash imports
import { HTTPError } from "@/src/core/errors/HTTPError.ts";
import { Status, StatusByCode } from "@/src/core/http/Status.ts";
import { Status as StatusUtils } from "@/src/standard/http/Status.ts";
import * as PolyfillRequestChain from "@/src/modules/RequestChain/polyfill.ts";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

type WebAPIContext = {
  url: string;
  method: string;
  request: Request;
  response?: Response;
};

class Home extends PolyfillRequestChain.Resource {
  public paths = ["/"];

  public GET(context: WebAPIContext) {
    context.response = new Response("Hello from GET.");
    return context;
  }

  public POST(context: WebAPIContext) {
    context.response = new Response("Hello from POST.");
    return context;
  }

  public DELETE(context: WebAPIContext) {
    throw new Error("Hey, I'm the DELETE endpoint. Errrr.");
  }

  public PATCH(context: WebAPIContext) {
    throw new HTTPError(405);
  }
}

const chain = PolyfillRequestChain
  .builder()
  .resources(Home)
  .build<WebAPIContext, WebAPIContext>();

export const send = (
  request: Request,
): Promise<Response> => {

  const context = {
    request,
    url: request.url,
    method: request.method,
  };

  return chain
    .handle(context)
    .then((returnedContext) => {
      if (returnedContext.response) {
        return returnedContext.response;
      }

      return new Response(
        "Response not generated",
        StatusUtils.toResponseFields(500)
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
        status: StatusByCode[500].Code,
        statusText: StatusByCode[500].Description,
      });
    });
};
