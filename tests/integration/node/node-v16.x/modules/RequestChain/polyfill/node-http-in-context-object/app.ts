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

import { IncomingMessage, ServerResponse } from "node:http";

import { HTTPError } from "../../../../../../../../.drashland/lib/esm/core/errors/HTTPError";
import { StatusCode } from "../../../../../../../../.drashland/lib/esm/core/http/response/StatusCode";
import { StatusDescription } from "../../../../../../../../.drashland/lib/esm/core/http/response/StatusDescription";
import * as Chain from "../../../../../../../../.drashland/lib/esm/modules/RequestChain/mod.polyfill";

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
