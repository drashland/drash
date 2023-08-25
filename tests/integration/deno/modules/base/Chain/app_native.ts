import { AbstractResource } from "@/src/standard/http/AbstractResource.ts";
import { Chain as BaseChain } from "@/src/modules/base/Chain.ts";
import { HTTPError } from "@/src/standard/errors/HTTPError.ts";
import { RequestParamsParser } from "@/src/standard/handlers/RequestParamsParser.ts";
import { RequestValidator } from "@/src/standard/handlers/RequestValidator.ts";
import { ResourceCaller } from "@/src/standard/handlers/ResourceCaller.ts";
import { ResourceNotFoundHandler } from "@/src/standard/handlers/ResourceNotFoundHandler.ts";
import { URLPatternResourcesIndex } from "@/src/modules/RequestChain/native/URLPatternResourcesIndex.ts";
import { StatusCode } from "@/src/standard/http/response/StatusCode.ts";
import { StatusDescription } from "@/src/standard/http/response/StatusDescription.ts";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

class Home extends AbstractResource {
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

const chain = BaseChain
  .builder()
  .handler(new RequestValidator())
  .handler(new URLPatternResourcesIndex(Home)) // Using native `URLPattern`
  .handler(new ResourceNotFoundHandler())
  .handler(new RequestParamsParser())
  .handler(new ResourceCaller())
  .build<Request, Promise<Response>>();

export const send = (
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
