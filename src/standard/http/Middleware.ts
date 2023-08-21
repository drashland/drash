/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
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
import { Status } from "../../core/http/Status.ts";
import type { ConstructorWithArgs } from "../../core/types/ConstructorWithArgs.ts";
import type { IResource } from "../../core/interfaces/IResource.ts";
import type { MethodOf } from "../../core/types/MethodOf.ts";

// Imports > Standard
import { ResourceProxy } from "./ResourceProxy.ts";

interface IMiddleware extends IResource {
  ALL(request: unknown): unknown;
}

type MiddlewareClass = ConstructorWithArgs<IMiddleware>;

class Middleware<I, O> extends ResourceProxy<Middleware<I, O>, I, O> {
  /**
   * Run this middlware on all requests.
   * @param request
   * @returns The result of the call or the resource's HTTP method.
   */
  ALL(input: I): O {
    if (
      this.original && ("ALL" in this.original) &&
      (typeof this.original.ALL === "function")
    ) {
      return this.original.ALL(input);
    }

    if (!("method" in (input as Record<string, unknown>))) {
      throw new HTTPError(
        Status.UnprocessableEntity.Code,
        `Request method could not be read`,
      );
    }

    // @ts-ignore
    const method = (input as { method: MethodOf<typeof this> }).method;

    // @ts-ignore
    if (typeof this[method] !== "function") {
      throw new Error("Test");
    }

    // @ts-ignore
    return this[method](input);
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type IMiddleware, Middleware, type MiddlewareClass };
