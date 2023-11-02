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
import { MethodOf } from "../../core/Types.ts";
import { Resource } from "../../core/http/Resource.ts";

// Imports > Standard
import { Handler } from "./Handler.ts";

type Input = { request: { method: string }; resource: Resource };

class ResourceCaller extends Handler {
  handle<Output>(input: Input): Promise<Output> {
    return Promise
      .resolve()
      .then(() => this.#validate(input))
      .then(() => this.#sendRequestToResource(input));
  }

  #sendRequestToResource<Output>(input: Input): Promise<Output> {
    const httpMethod = input.request.method.toUpperCase();

    return Promise
      .resolve()
      .then(() => {
        return input.resource[httpMethod as MethodOf<Resource>](
          input.request,
        );
      }) as Promise<Output>;
  }

  #validate(input: unknown): void {
    if (!input || typeof input !== "object") {
      throw new Error("Input received is not an object");
    }

    if (
      !("request" in input) || !input.request ||
      typeof input.request !== "object"
    ) {
      throw new Error("Input request received is not an object");
    }

    if (
      !("method" in input.request) || typeof input.request.method !== "string"
    ) {
      throw new Error("Input request method could not be read");
    }

    if (!("resource" in input) || typeof input.resource !== "object") {
      throw new Error("Input resource received is not an object");
    }
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Input, ResourceCaller };
