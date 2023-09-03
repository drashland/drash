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
import { Status } from "../../../../../../../../.drashland/lib/esm/core/http/response/Status";

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
    throw new HTTPError(Status.MethodNotAllowed);
  }
}

const chain = Chain
  .builder()
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
        "status_code" in error &&
        "status_code_description" in error
      ) {
        res.statusCode = error.status_code;
        res.statusMessage = error.status_code_description;
        res.end(error.message);
        return;
      }

      res.statusCode = StatusCode.InternalServerError;
      res.statusMessage = StatusDescription.InternalServerError;
      res.end(error.message);
    });
};
