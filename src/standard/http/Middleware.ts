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
import { StatusCode } from "../../core/http/response/StatusCode.ts";
import type { MethodOf } from "../../core/types/MethodOf.ts";

// Imports > Standard
import { ResourceProxy } from "./ResourceProxy.ts";

class Middleware extends ResourceProxy {
  /**
   * Run this middlware on all requests.
   * @param request
   * @returns The result of the call or the resource's HTTP method.
   */
  ALL(input: unknown): unknown {
    if (
      this.original_instance && ("ALL" in this.original_instance) &&
      (typeof this.original_instance.ALL === "function")
    ) {
      return this.original_instance.ALL(input);
    }

    if (!("method" in (input as Record<string, unknown>))) {
      throw new HTTPError(
        StatusCode.UnprocessableEntity,
        `Request method could not be read`,
      );
    }

    // @ts-ignore TODO(crookse) Typing
    const method = (input as { method: MethodOf<typeof this> }).method;

    // @ts-ignore TODO(crookse) Typing
    if (typeof this[method] !== "function") {
      throw new HTTPError(StatusCode.NotImplemented);
    }

    // @ts-ignore TODO(crookse) Typing
    return this[method](input);
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { Middleware };
