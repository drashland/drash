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

import { IRequestMethods, IResource } from "../../core/Interfaces.ts";
import { MethodOf } from "../../core/Types.ts";
import { Resource } from "../../core/http/Resource.ts";

// Imports > Core

// Imports > Standard

class Middleware implements IRequestMethods {
  protected original?: IRequestMethods;

  public setOriginal(original: IRequestMethods) {
    this.original = original;
  }

  public next<ReturnValue>(input: unknown): ReturnValue {
    if (
      !input
      || typeof input !== "object"
      || !("method" in input)
      || typeof input.method !== "string"
      || typeof this.original !== "object"
      || !(input.method in this.original)
      || !this.original
      || typeof this.original[input.method as MethodOf<IResource>] !== "function"
    ) {
      throw new Error("Middleware could not process request further");
    }

    const method = input.method as MethodOf<IRequestMethods>

    return this.original[method](input) as ReturnValue;
  }

  /**
   * Use this method to intercept the request before it is passed to the
   * resource's HTTP method. With this method, you can short-circuit the
   * request, modify the request, send the request to the resource based on
   * conditions, etc.
   *
   * To send the request to the resource (or next middleware), call
   * `this.next<ReturnType>(input)`. See example for more details.
   *
   * @param input The input to help produce an output.
   * @returns An output based on the input.
   *
   * @example
   * ```typescript
   * class MyMiddleware extends Middleware {
   *   public ALL(request) {
   *
   *     // If the `x-hello` header is valid ...
   *     if (request.headers.get("x-hello") === "world") {
   *
   *       // ..., then allow the request further down the request
   *       // chain. Also, use `<Resonse>` to specify that the value
   *       // returned from `this.next()` is a `Response`.
   *       return this.next<Response>(request);
   *     }
   *
   *     // Otherwise, short-circuit the request by throwing a 401
   *     // error to the caller
   *     throw new HTTPError(Status.Unauthorized);
   *   }
   * }
   * ```
   */
  public ALL(input: unknown) {
    return this.next<unknown>(input);
  }

  public CONNECT(input: unknown): unknown {
    return this.#delegate(input, "CONNECT");
  }

  public DELETE(input: unknown): unknown {
    return this.#delegate(input, "DELETE");
  }

  public GET(input: unknown): unknown {
    return this.#delegate(input, "GET");
  }

  public HEAD(input: unknown): unknown {
    return this.#delegate(input, "HEAD");
  }

  public OPTIONS(input: unknown): unknown {
    return this.#delegate(input, "OPTIONS");
  }

  public PATCH(input: unknown): unknown {
    return this.#delegate(input, "PATCH");
  }

  public POST(input: unknown): unknown {
    return this.#delegate(input, "POST");
  }

  public PUT(input: unknown): unknown {
    return this.#delegate(input, "PUT");
  }

  public TRACE(input: unknown): unknown {
    return this.#delegate(input, "TRACE");
  }

  #delegate(input: unknown, method: MethodOf<Resource>): unknown {

    if (!this.original) {
      throw new Error("Failed to create middleware. No original.");
    }


    if (
      "ALL" in this
      && this.ALL
      && typeof this.ALL === "function"
    ) {
      return this.ALL(input);
    }

    return this.original![method as MethodOf<typeof this.original>](input);
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { Middleware };
