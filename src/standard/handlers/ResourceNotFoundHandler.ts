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

/**
 * Throws `404` when the resource index matched nothing.
 *
 * @module
 */

// Imports > Core
import { HTTPError } from "../../core/errors/HTTPError.ts";
import type { Resource } from "../../core/http/Resource.ts";
import { Status } from "../../core/http/response/Status.ts";

// Imports > Standard
import { Handler } from "./Handler.ts";

/**
 * What this handler requires: the request and the index's search result, which
 * is `null` when nothing matched.
 */
type Input = {
  request: {
    url: string;
  };

  result: {
    resource: Resource;
    path_params: Record<string, string>;
  };
};

/**
 * Turns a failed resource lookup into a `404`.
 *
 * The index reports a miss as `null` rather than throwing, so this handler is
 * where a miss becomes an error.
 */
class ResourceNotFoundHandler extends Handler {
  /**
   * Pass the request on if a resource matched, or throw if none did.
   *
   * @param input The request and the index's search result.
   * @returns Whatever the rest of the chain returns.
   * @throws {HTTPError} `404 Not Found` if nothing matched the URL.
   */
  override handle<Output>(input: Input): Promise<Output> {
    return Promise
      .resolve()
      .then(() => this.#validate(input))
      .then(() =>
        super.sendToNextHandler<Output>({
          request: input.request,
          resource: input.result.resource,
          request_params: {
            path_params: input.result.path_params,
          },
        })
      );
  }

  #validate(input: unknown): void {
    if (!input || typeof input !== "object") {
      throw new HTTPError(
        Status.InternalServerError,
        "Request could not be read",
      );
    }

    if (
      !("request" in input) || !input.request ||
      typeof input.request !== "object"
    ) {
      throw new HTTPError(
        Status.InternalServerError,
        "Request could not be read",
      );
    }

    if (
      !("result" in input) || !input.result || typeof input.result !== "object"
    ) {
      throw new HTTPError(Status.NotFound);
    }

    if (!("resource" in input.result) || !input.result.resource) {
      throw new HTTPError(Status.NotFound);
    }
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Input, ResourceNotFoundHandler };
