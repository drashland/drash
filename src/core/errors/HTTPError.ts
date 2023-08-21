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

import { Status, StatusByCode } from "../http/Status.ts";
import type { HTTPStatusCode } from "../types/HTTPStatusCode.ts";

/**
 * Base class for all HTTP errors in Drash. Use this class to throw uniform HTTP
 * errors.
 *
 * @example
 *
 * ```ts
 * // Usage in resource's GET method
 *
 * class MyResource extends Resource {
 *   public GET(request: Request) {
 *     if (!request.header("authorization")) {
 *       throw new HTTPError(401, "Get out!");
 *     }
 *
 *     return new Response("Authed");
 *   }
 * }
 * ```
 */
export class HTTPError extends Error {
  /**
   * The HTTP status code associated with this error.
   */
  public readonly code: HTTPStatusCode;

  /**
   * The name of this error to be used with conditionals that do not work with
   * `instanceof`.
   *
   * @example
   * ```ts
   * // If this is false ...
   * console.log(error instanceof HTTPError);
   *
   * // ... then do this
   * console.log(error.name === 'HTTPError');
   * ```
   */
  public readonly name = "HTTPError";

  #code_description: string;

  /**
   * The description to `this.code`.
   */
  get code_description(): string {
    return StatusByCode[this.code].Description;
  }

  /**
   * @param statusCode A valid HTTP status code. If an unknown HTTP status code
   * is provided, then `500` will be used.
   * @param message (optional) The error message.
   */
  constructor(statusCode: HTTPStatusCode, message?: string) {
    super(message);

    const codeObj = StatusByCode[statusCode] ??
      Status.InternalServerError;
    this.code = codeObj.Code;
    this.#code_description = codeObj.Description;

    this.message = this.#code_description ??
      "An error occurred (an error message was not provided)";
  }
}
