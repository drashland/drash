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

import { AbstractResource } from "../../../../../../../.drashland/lib/esm/standard/http/AbstractResource";
import { Chain as BaseChain } from "../../../../../../../.drashland/lib/esm/modules/base/Chain";
import { HTTPError } from "../../../../../../../.drashland/lib/esm/standard/errors/HTTPError";
import { RequestParamsParser } from "../../../../../../../.drashland/lib/esm/standard/handlers/RequestParamsParser";
import { RequestValidator } from "../../../../../../../.drashland/lib/esm/standard/handlers/RequestValidator";
import { ResourceCaller } from "../../../../../../../.drashland/lib/esm/standard/handlers/ResourceCaller";
import { ResourceNotFoundHandler } from "../../../../../../../.drashland/lib/esm/standard/handlers/ResourceNotFoundHandler";
import { StatusCode } from "../../../../../../../.drashland/lib/esm/standard/http/response/StatusCode";
import { StatusDescription } from "../../../../../../../.drashland/lib/esm/standard/http/response/StatusDescription";

import { URLPatternPolyfillResourcesIndex } from "../../../../../../../.drashland/lib/esm/modules/RequestChain/polyfill/URLPatternPolyfillResourcesIndex";

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
    throw new HTTPError(ResponseStatus.MethodNotAllowed);
  }
}

const chain = BaseChain
  .builder()
  .handler(new RequestValidator())
  .handler(new URLPatternPolyfillResourcesIndex(Home)) // Using native `URLPattern`
  .handler(new ResourceNotFoundHandler())
  .handler(new RequestParamsParser())
  .handler(new ResourceCaller())
  .build<Request, Promise<Response>>();

export const handleRequest = (
  request: Request,
  _bindings: unknown,
) => {
  return chain
    .handle(request)
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
