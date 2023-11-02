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

// Imports > Core
import { HTTPError } from "../../core/errors/HTTPError.ts";
import { Resource } from "../../core/http/Resource.ts";
import { Status } from "../../core/http/response/Status.ts";

// Imports > Standard
import { Handler } from "./Handler.ts";

type Input = {
  request: {
    url: string;
  };

  result: {
    resource: Resource;
    path_params: Record<string, string>;
  };
};

class ResourceNotFoundHandler extends Handler {
  handle<Output>(input: Input): Promise<Output> {
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
