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

import { Status } from "../../../core/http/response/Status.ts";
import { ResponseBuilder } from "../../builders/ResponseBuilder.ts";
import { Header as CoreHeader } from "../../../core/http/Header.ts";

const Header = {
  XRateLimitLimit: "X-RateLimit-Limit",
  XRateLimitRemaining: "X-RateLimit-Remaining",
  XRateLimitReset: "X-RateLimit-Reset",
  XRetryAfter: "X-Retry-After",
} as const;

/**
 * A `Response` decorator that attaches the following behaviors:
 *
 * - Response building
 * - X-RateLimit-* header setting
 */
class RateLimitResponseBuilder extends ResponseBuilder {
  /** The response to decorate. */
  protected decoratee: Response;

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
   * Add the `x-ratelimit-*` headers to the response.
   *
   * @param values The values for the `x-ratelimit-*` headers.
   *
   * @returns This for further method chaining.
   */
  public addRateLimitHeaders(values: {
    limit: number;
    remaining: number;
    reset: number;
    retry_after: Date;
  }) {
    const headers = {
      [CoreHeader.RetryAfter]: values.retry_after.toUTCString(),
      [Header.XRateLimitLimit]: values.limit.toString(),
      [Header.XRateLimitRemaining]: values.remaining.toString(),
      [Header.XRateLimitReset]: values.reset.toString(),
    };

    this.headers(headers);

    return this;
  }

  /**
   * @returns A `Response` object using the values set in this class. Notes:
   * - The values set in this class take precedence
   * - Any value not set in this class will be replaced with the wrapped
   *   response's value
   */
  public build(): Response {
    let status = this.response_init.status;
    if (!status) {
      status = this.decoratee.status;
    }

    let statusText;
    for (const [_key, { code, description }] of Object.entries(Status)) {
      if (status === code) {
        statusText = description;
        break;
      }
    }
    if (!statusText) {
      statusText = this.decoratee.statusText;
    }

    let body = this.response_body;
    if (!body) {
      body = this.decoratee.body;
    }

    // Keep the decoratee's headers intact and append any headers that were set
    // in this class. Headers in this class that have the same name as headers
    // in the decoratee's headers will be overwritten.
    const headers = this.decoratee.headers ?? new Headers();

    for (const [key, value] of this.response_headers) {
      headers.set(key, value);
    }

    const r = new Response(body, {
      status,
      statusText,
      headers,
    });

    return r;
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
  return new RateLimitResponseBuilder(response);
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { RateLimitResponseBuilder, response };
