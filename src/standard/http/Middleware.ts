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

import { MethodOf } from "../../core/Types.ts";
import { HTTPError } from "../../core/errors/HTTPError.ts";
import { Resource } from "../../core/http/Resource.ts";
import { Status } from "../../core/http/response/Status.ts";

// Imports > Core

// Imports > Standard

class Middleware extends Resource {
  public original?: Resource;

  public setOriginal(original: Resource) {
    this.original = original;
  }

  public next<ReturnValue>(input: unknown): ReturnValue {
    if (
      !input ||
      (typeof input !== "object") ||
      !("method" in input) ||
      (typeof input.method !== "string") ||
      !this.original ||
      (typeof this.original !== "object") ||
      !(input.method in this.original) ||
      (typeof this.original[input.method as MethodOf<Resource>]) !== "function"
    ) {
      throw new Error("Middleware could not process request further");
    }

    const method = input.method as MethodOf<Resource>;

    const response = this.original[method](input);

    if (!response) {
      throw new HTTPError(
        Status.InternalServerError,
        "The server was unable to generate a response",
      );
    }

    return response as ReturnValue;
  }

  /**
   * @TODO (crookse) Is this needed?
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
    return this.#callOriginalHttpMethod(input, "CONNECT");
  }

  public DELETE(input: unknown): unknown {
    return this.#callOriginalHttpMethod(input, "DELETE");
  }

  public GET(input: unknown): unknown {
    return this.#callOriginalHttpMethod(input, "GET");
  }

  public HEAD(input: unknown): unknown {
    return this.#callOriginalHttpMethod(input, "HEAD");
  }

  public OPTIONS(input: unknown): unknown {
    return this.#callOriginalHttpMethod(input, "OPTIONS");
  }

  public PATCH(input: unknown): unknown {
    return this.#callOriginalHttpMethod(input, "PATCH");
  }

  public POST(input: unknown): unknown {
    return this.#callOriginalHttpMethod(input, "POST");
  }

  public PUT(input: unknown): unknown {
    return this.#callOriginalHttpMethod(input, "PUT");
  }

  public TRACE(input: unknown): unknown {
    return this.#callOriginalHttpMethod(input, "TRACE");
  }

  /**
   * Call this middleware's original class' HTTP method.
   * @param input The input passed to this middleware and to forward to the
   * original class this middleware wraps.
   * @param method The HTTP method to call on the original.
   * @returns The result of the original's HTTP method call.
   */
  #callOriginalHttpMethod(
    input: unknown,
    method: MethodOf<Middleware>,
  ): unknown {
    if (!this.original) {
      throw new Error("Failed to create middleware. No original.");
    }

    if (
      "ALL" in this &&
      this.ALL &&
      typeof this.ALL === "function"
    ) {
      return this.ALL(input);
    }

    return this.original![method as MethodOf<typeof this.original>](input);
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { Middleware };
