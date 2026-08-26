/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
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

import { IncomingMessage, ServerResponse } from "node:http";

import { HTTPError } from "../../../../../../../../dist/core/errors/HTTPError";
import { StatusCode } from "../../../../../../../../dist/core/http/response/StatusCode";
import { StatusDescription } from "../../../../../../../../dist/core/http/response/StatusDescription";
import {
  Application,
  Resource,
} from "../../../../../../../../dist/modules/http.polyfill";
import { Status } from "../../../../../../../../dist/core/http/response/Status";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

type NodeContext = {
  url: string;
  method?: string;
  request: IncomingMessage;
  response: ServerResponse<IncomingMessage>;
};

/**
 * What a resource actually receives: `RequestParamsParser` defines `params` on
 * the context object before the chain reaches the resource.
 */
type NodeContextWithParams = NodeContext & {
  params: {
    pathParam(param: string): string | undefined;
    queryParam(param: string): string | undefined;
  };
};

class Home extends Resource {
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
    throw new HTTPError(Status.MethodNotAllowed);
  }
}

class Query extends Resource {
  public paths = ["/query"];

  public GET(context: NodeContextWithParams) {
    // Reading the *first* query param is the case that regressed. See
    // src/standard/handlers/RequestParamsParser.ts.
    context.response.write(context.params.queryParam("first") ?? "undefined");
    return context;
  }
}

const app = Application
  .builder()
  .resources(Home, Query)
  .build();

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

  return app
    .handle<NodeContext>(context)
    // There is no `.then((response) => { ... })` block here because resources
    // use `context.response.end()` which tells Node the ServerResponse ended
    .catch((error: Error | HTTPError) => {
      if (
        (error.name === "HTTPError" || error instanceof HTTPError) &&
        "status_code" in error &&
        "status_code_description" in error
      ) {
        context.response.statusCode = error.status_code;
        context.response.statusMessage = error.status_code_description;
        context.response.end(error.message);
      } else {
        context.response.statusCode = StatusCode.InternalServerError;
        context.response.statusMessage = StatusDescription.InternalServerError;
        context.response.end(error.message);
      }

      return context;
    });
};
