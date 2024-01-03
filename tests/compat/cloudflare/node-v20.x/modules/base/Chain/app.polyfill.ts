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

import { HTTPError } from "../../../../../../../dist/core/errors/HTTPError.js";
import { Resource } from "../../../../../../../dist/core/http/Resource.js";
import { Status } from "../../../../../../../dist/core/http/response/Status.js";
import { StatusCode } from "../../../../../../../dist/core/http/response/StatusCode.js";
import { StatusDescription } from "../../../../../../../dist/core/http/response/StatusDescription.js";
import { Chain as BaseChain } from "../../../../../../../dist/modules/base/Chain.js";
import { RequestParamsParser } from "../../../../../../../dist/standard/handlers/RequestParamsParser.js";
import { RequestValidator } from "../../../../../../../dist/standard/handlers/RequestValidator.js";
import { ResourceCaller } from "../../../../../../../dist/standard/handlers/ResourceCaller.js";
import { ResourceNotFoundHandler } from "../../../../../../../dist/standard/handlers/ResourceNotFoundHandler.js";
import { ResourcesIndex } from "../../../../../../../dist/standard/handlers/ResourcesIndex.js";
import { URLPatternPolyfill } from "../../../../../../../src/standard/polyfill/URLPatternPolyfill.js";

export const protocol = "http";
export const hostname = "localhost";
export const port = 1447;

class Home extends Resource {
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

const chain = BaseChain
  .builder()
  .handler(new RequestValidator())
  .handler(new ResourcesIndex(URLPatternPolyfill, Home))
  .handler(new ResourceNotFoundHandler())
  .handler(new RequestParamsParser())
  .handler(new ResourceCaller())
  .build();

export const handleRequest = (
  request: Request,
  _bindings: unknown,
) => {
  return chain
    .handle<Response>(request)
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

export default { fetch: handleRequest };
