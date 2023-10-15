/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023  Drash authors. The Drash authors are listed in the
 * AUTHORS file at <https://github.com/drashland/drash/AUTHORS>. This notice
 * applies to Drash version 3.X.X and any later version.
 *
 * This file is part of Drash. See <https://github.com/drashland/drash>.
 *
 * Drash is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * Drash is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Drash. If not, see <https://www.gnu.org/licenses/>.
 */

import { Chain as BaseChain } from "../../../../../../../src/modules/base/Chain.ts";
import { Handler } from "../../../../../../../src/standard/handlers/Handler.ts";
import { Resource } from "../../../../../../../src/modules/RequestChain/mod.native.ts";
import { ResourceNotFoundHandler } from "../../../../../../../src/standard/handlers/ResourceNotFoundHandler.ts";
import { StatusDescription } from "../../../../../../../src/core/http/response/StatusDescription.ts";
import { StatusCode } from "../../../../../../../src/core/http/response/StatusCode.ts";
import { HTTPError } from "../../../../../../../src/core/errors/HTTPError.ts";
import {
  ResourcesIndex,
  SearchResult,
} from "../../../../../../../src/standard/handlers/ResourcesIndex.ts";
import { Status } from "../../../../../../../src/core/http/response/Status.ts";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

type Ctx = {
  request: Request;
  response?: Response;
  resource?: Resource;
};

class Home extends Resource {
  public paths = ["/"];

  public GET(ctx: Ctx) {
    ctx.response = new Response(`Hello from GET.`);
  }

  public POST(ctx: Ctx) {
    ctx.response = new Response("Hello from POST.");
  }

  public DELETE(_ctx: Ctx) {
    throw new Error("Hey, I'm the DELETE endpoint. Errrr.");
  }

  public PATCH(_ctx: Ctx) {
    throw new HTTPError(Status.MethodNotAllowed);
  }
}

// Set up a wrapper to use `.use( (...) => {...} )` instead of `.handler(new Handler())`

class UseInsteadOfHandleBuilder extends BaseChain.Builder {
  public use(handlerFn: (ctx: Ctx) => void): this {
    class UseHandler extends Handler {
      handle<Output>(ctx: Ctx) {
        return Promise
          .resolve()
          .then(() => handlerFn(ctx))
          .then(() => {
            if (this.next !== null) {
              return super.sendToNextHandler<Output>(ctx);
            }

            return ctx as Output; // Intentional cast for now
          });
      }
    }

    const handler = new UseHandler();

    Object.defineProperty(handler.constructor, "name", {
      value: handlerFn.name,
    });

    return super.handler(handler);
  }
}

// Build the chain

// @ts-ignore We know URLPattern exists if dev'ing with Deno's extension
const resourceIndex = new ResourcesIndex(URLPattern, Home);
const resourceNotFoundHandler = new ResourceNotFoundHandler();
class ReturnSearchResult extends Handler {
  handle<Output extends SearchResult>(result: Output): Promise<Output> {
    return Promise.resolve(result);
  }
}

resourceIndex
  .setNext(resourceNotFoundHandler)
  .setNext(new ReturnSearchResult());

const chain = (new UseInsteadOfHandleBuilder())
  .use(function ReceiveRequest(ctx: Ctx) {
    if (!ctx.request) {
      throw new Error("No request found");
    }
  })
  .use(function FindResource(ctx) {
    return resourceIndex
      .handle<SearchResult>(ctx.request) // Last handler is `ReturnSearchResult` and we can chain `then` from it
      .then((result) => {
        ctx.resource = result?.resource;
      });
  })
  .use(function CallResource(ctx: Ctx) {
    if (!ctx.resource) {
      throw new HTTPError(Status.InternalServerError, "No resource");
    }
    const method = ctx.request.method?.toUpperCase();
    // @ts-ignore We know this exists
    return ctx.resource[method](ctx);
  })
  .use(function SendResponse(ctx) {
    if (!ctx.response) {
      ctx.response = new Response("Woops", { status: 500 });
    }
  })
  .build();

export const handleRequest = (
  request: Request,
): Promise<Response> => {
  const ctx: Ctx = { request };

  return chain
    .handle<void>(ctx)
    .then(() => {
      if (!ctx.response) {
        return new Response("No response", { status: 500 });
      }

      return ctx.response;
    })
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
