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

import { Builder } from "../../standard/builders/Builder.ts";

/**
 * A builder to help build a `Response` object. This is useful if the response's
 * data needs to be modified throughout a lifecycle, but not instantiated into a
 * `Response` object until required.
 *
 * @example
 * ```ts
 * const builder = new ResponseBuilder();
 *
 * // This call ...
 * const resA = builder
 *   .headers({
 *     "x-some-header": "Some Value"
 *     "x-some-other-header": "Some Other Value",
 *   })
 *   .body("Nope.")
 *   .status(400)
 *   .statusText("Bad Request")
 *   .build();
 *
 * // ... results in the same response as this call ...
 * const resB = new Response("Nope.", {
 *   status: 400,
 *   statusText: "Bad Request",
 *   headers: {
 *     "x-some-header": "Some Value"
 *     "x-some-other-header": "Some Other Value",
 *   }
 * })
 * ```
 */
class ResponseBuilder implements Builder<Response> {
  protected response_body: BodyInit | null = null;
  protected response_headers = new Headers();
  protected response_init: ResponseInit = {
    status: 200,
    statusText: "OK",
  };

  /**
   * Set the body the built response will use as its {@link BodyInit}.
   *
   * @param body See {@link BodyInit}.
   *
   * @returns This instance.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response/body}
   */
  body(body: BodyInit | null) {
    this.response_body = body;
    return this;
  }

  /**
   * Set the headers (using key-value pairs) the built response will use as its
   * {@link ResponseInit.headers}.
   *
   * @param headers A key-value pair of headers where the key is the header name
   * and the value is the header value.
   *
   * @returns This instance.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response/headers}
   */
  headers(headers: Record<string, string>) {
    for (const [k, v] of Object.entries(headers)) {
      this.response_headers.set(k, v);
    }

    return this;
  }

  /**
   * Set the status the built response will use as its
   * {@link ResponseInit.status}.
   *
   * @param status See {@link ResponseInit.status}.
   *
   * @returns This instance.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response/status}
   */
  status(status: number) {
    this.response_init.status = status;
    return this;
  }

  /**
   * Set the {@link ResponseInit.statuText} property.
   *
   * @param statusText See {@link ResponseInit.statuText}.
   *
   * @returns This instance.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response/statusText}
   */
  statusText(statusText: string) {
    this.response_init.statusText = statusText;
    return this;
  }

  /**
   * @returns A `Response` object using the values set in this builder.
   */
  build() {
    return new Response(this.response_body, {
      ...this.response_init,
      headers: this.response_headers,
    });
  }
}

/**
 * Get a {@link Response} builder.
 *
 * @returns A response builder.
 *
 * @see {@link ResponseBuilder} for implementation details.
 */
function response() {
  return new ResponseBuilder();
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { response, ResponseBuilder };
