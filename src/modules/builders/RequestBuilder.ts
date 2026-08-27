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
 * Builds a Web `Request` by chaining, for tests and for calling a chain without
 * a server in front of it.
 *
 * @module
 */

export class RequestBuilder {
  #request: RequestInit = {};
  #path = "<path not provided>";

  /**
   * Set the URL the built request will be sent to.
   *
   * @param path The request URL.
   * @returns This builder, for chaining.
   */
  path(path: string): this {
    this.#path = path;
    return this;
  }

  /**
   * Set the request method to `GET`.
   *
   * @returns This builder, for chaining.
   */
  get(): this {
    this.#request.method = "get";
    return this;
  }

  /**
   * Set the request method to `POST`.
   *
   * @returns This builder, for chaining.
   */
  post(): this {
    this.#request.method = "post";
    return this;
  }

  /**
   * Set the request method to `PUT`.
   *
   * @returns This builder, for chaining.
   */
  put(): this {
    this.#request.method = "put";
    return this;
  }

  /**
   * Set the request method to `PATCH`.
   *
   * @returns This builder, for chaining.
   */
  patch(): this {
    this.#request.method = "patch";
    return this;
  }

  /**
   * Set the request method to `DELETE`.
   *
   * @returns This builder, for chaining.
   */
  delete(): this {
    this.#request.method = "delete";
    return this;
  }

  /**
   * Produce the request from everything set on this builder.
   *
   * @returns The built `Request`.
   */
  build(): Request {
    return new Request(this.#path, this.#request);
  }
}

/**
 * Get a {@link Request} builder.
 *
 * @returns A response builder.
 *
 * @see {@link RequestBuilder} for implementation details.
 */
export function request(): RequestBuilder {
  return new RequestBuilder();
}
