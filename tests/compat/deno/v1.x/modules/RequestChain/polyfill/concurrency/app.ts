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

import { Status } from "../../../../../../../../src/core/http/response/Status.ts";
import { StatusCode } from "../../../../../../../../src/core/http/response/StatusCode.ts";
import { StatusDescription } from "../../../../../../../../src/core/http/response/StatusDescription.ts";
import * as Chain from "../../../../../../../../src/modules/chains/RequestChain/mod.polyfill.ts";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

class Accounts extends Chain.Resource {
  public paths = ["/accounts"];

  public GET(request: Request) {
    if (request.headers.get("x-wait-1")) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            new Response(
              "Waited for x-wait-1!",
              { status: 200 },
            ),
          );
        }, 250);
      });
    }

    if (request.headers.get("x-wait-2")) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            new Response(
              "Waited for x-wait-2!",
              { status: 200 },
            ),
          );
        }, 1000);
      });
    }

    if (request.headers.get("x-wait-3")) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            new Response(
              "Waited for x-wait-3!",
              { status: 200 },
            ),
          );
        }, 1000);
      });
    }

    return new Response(
      "Hello from Accounts.GET(). Didn't wait!",
      { status: 200 },
    );
  }
}

class Users extends Chain.Resource {
  public paths = ["/users"];

  public GET(_request: Request) {
    throw new Chain.HTTPError(Status.MethodNotAllowed);
  }
}

const chain = Chain
  .builder()
  .resources(Accounts, Users)
  .build();

export const handleRequest = (
  request: Request,
): Promise<Response> => {
  return chain
    .handle<Response>(request)
    .catch((error: Error | Chain.HTTPError) => {
      if (
        (error.name === "HTTPError" || error instanceof Chain.HTTPError) &&
        "status_code" in error &&
        "status_code_description" in error
      ) {
        return new Response(`error.message: ${error.message}`, {
          status: error.status_code,
          statusText: error.status_code_description,
        });
      }

      return new Response(`error.message: ${error.message}`, {
        status: StatusCode.InternalServerError,
        statusText: StatusDescription.InternalServerError,
      });
    });
};
