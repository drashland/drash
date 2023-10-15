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

import { ResponseBuilder } from "../../builders/ResponseBuilder.ts";

type Options = {
  /** Should the ETag contain the weak "W/" directive? See "W/" under {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag#directives}. */
  weak?: boolean;
  /**  */
  max_hash_length?: number;
};

/**
 * A `Response` decorator that attaches the following behaviors:
 *
 * - Response building
 * - ETag and ETag-related header setting
 * - Response body hashing
 */
class ETagResponseBuilder extends ResponseBuilder {
  /** The response to decorate. */
  protected decoratee: Response;

  /** The options this decorator will use when processing the response. */
  #default_options: Options = {
    weak: false,
    max_hash_length: 27,
  };

  /**
   * Decorate a `Response` with X-RateLimit-* header capabilities.
   *
   * @param response The response to decorate.
   */
  constructor(response: Response) {
    super();
    this.decoratee = response;
  }

  /**
   * Add the ETag header to the response.
   *
   * @param options See {@link Options}.
   *
   * @returns A `Promise` with `this` instance as the resulting value.
   */
  public addETagHeader(options: Options = this.#default_options) {
    return this
      .etagHeader(options)
      .then((etag) => {
        this.headers({
          etag,
        });

        return this;
      });
  }

  /**
   * Create the ETag header from the response's body.
   *
   * @param options See {@link Options}.
   *
   * @returns A `Promise` with the ETag header as the resulting value.
   */
  public etagHeader(options: Options = this.#default_options) {
    return this
      .hash(options.max_hash_length)
      .then((hash) => {
        return this.decoratee
          .clone()
          .text()
          .then((text) => text.length.toString(16))
          .then((text) => `"${text}-${hash}"`);
      })
      .then((header) => {
        if (options.weak) {
          return "W/" + header;
        }

        return header;
      });
  }

  /**
   * Create a base-64 ASCII encoded string from text representation of the
   * response's body with a max length of the given `maxLength`.
   *
   * @param maxLength (Optional) The max length of the hash.
   *
   * @returns A `Promise` with the hash as he resulting value.
   */
  public hash(maxLength = 27) {
    return this.decoratee
      .clone()
      .text()
      .then((text) => btoa(text.substring(0, maxLength)));
  }
}

/**
 * Decorate the provided `response` with this module's decorator.
 *
 * @param response The response to decorate.
 *
 * @returns The decorated response.
 */
function response(response: Response) {
  return new ETagResponseBuilder(response);
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { ETagResponseBuilder, type Options, response };
