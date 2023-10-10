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

import { StatusCode } from "../../../../../../../../src/core/http/response/StatusCode.ts";
import { StatusDescription } from "../../../../../../../../src/core/http/response/StatusDescription.ts";
import * as Chain from "../../../../../../../../src/modules/RequestChain/mod.polyfill.ts";
import { Status } from "../../../../../../../../src/core/http/response/Status.ts";

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
    throw new Chain.HTTPError(Status.MethodNotAllowed);
  }
}

const chain = Chain
  .builder()
  .resources(Home)
  .build();

export const handleRequest = (
  request: Request,
): Promise<Response> => {
  const context = {
    request,
    url: request.url,
    method: request.method,
  };

  return chain
    .handle<WebAPIContext>(context)
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
    .catch((error: Error | Chain.HTTPError) => {
      if (
        (error.name === "HTTPError" || error instanceof Chain.HTTPError) &&
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
