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
 * Middleware that adds `ETag` and `Last-Modified` headers and answers `304 Not
 * Modified` when a client's cached copy is still current.
 *
 * @module
 */

import { Header } from "../../core/http/Header.ts";
import { Middleware } from "../../standard/http/Middleware.ts";
import { response } from "./e_tag/ETagResponse.ts";
import type { ResponseStatus, ResponseStatusName } from "../../core/Types.ts";
import { Status } from "../../core/http/response/Status.ts";
import { StatusCode } from "../../core/http/response/StatusCode.ts";
import { StatusDescription } from "../../core/http/response/StatusDescription.ts";
import { HTTPError } from "../../core/errors/HTTPError.ts";

/**
 * How ETags are generated: their maximum length, and whether they are weak.
 */
type Options = {
  /** The maximum length of the ETag header. */
  etag_max_length?: number;
  /** Add the "W/" directive to all generated ETag headers? */
  weak?: boolean;
};

/**
 * The request, its response, and the ETag computed for it, threaded through
 * this middleware's steps.
 */
export type Context = {
  request: Request;
  response: Response;
  /** The Etag header for this context's response. */
  etag?: string;
  /** A flag each handler function can use to see if it should or should not process the context further. */
  done?: boolean;
};

type CachedResource = {
  [Header.ETag]: string;
  [Header.LastModified]: string;
};

/**
 * Strong ETags, truncated to 27 characters — long enough that a collision is
 * not a practical concern, short enough to keep the header small.
 */
const defaultOptions: Options = {
  etag_max_length: 27,
  weak: false,
};

/**
 * Adds `ETag` and `Last-Modified` headers, and answers `304 Not Modified` when
 * a client's cached copy is still current.
 *
 * The ETag is computed from the response body, so the wrapped resource runs on
 * every request; what this saves is the response body on the wire, not the work
 * of producing it.
 */
class ETagMiddleware extends Middleware {
  #cache: Record<string, CachedResource> = {};
  #default_etag = '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
  #options: Options;

  /**
   * Construct the middleware that handles ETag and ETag-related headers.
   *
   * @param options (Optional) See {@link Options}.
   */
  constructor(options: Options = defaultOptions) {
    super();

    // TODO(crookse) Check if the options are correct before setting them.
    this.#options = {
      ...defaultOptions,
      ...options,
    };
  }

  /**
   * Handle any request by producing the response, then attaching cache headers or
   * replacing it with a `304`.
   *
   * @param request The request being handled.
   * @returns The resource's response with cache headers, or an empty `304`.
   */
  public override ALL(request: Request): Promise<Response> {
    return Promise
      .resolve()
      .then(() => this.handleEtagMatchesRequestIfMatchHeader(request))
      .then(() => super.next<Response>(request))
      .then((response) => ({ request, response }))
      .then((context) => this.handleIfResponseEmpty(context))
      .then((context) => this.createEtagHeader(context))
      .then((context) =>
        this.handleEtagMatchesRequestIfNoneMatchHeader(context)
      )
      .then((context) => this.sendResponse(context));
  }

  /**
   * Create the ETag header from the response's body.
   * @param context The context containing all data this middleware requires.
   * @returns The context
   */
  protected createEtagHeader(context: Context): Context | Promise<Context> {
    if (context.done) {
      return context;
    }

    return response(context.response)
      .etagHeader(this.#options)
      .then((etag) => {
        context.etag = etag;
        return context;
      });
  }

  /**
   * Produce a `Last-Modified` value for right now.
   *
   * @returns The current time as an HTTP date.
   */
  protected createLastModifiedHeader(): string {
    return new Date().toUTCString();
  }

  /**
   * Build the cache key for a request. Method and URL together, so the same URL
   * under different methods is cached separately.
   *
   * @param request The request to key.
   * @returns The cache key.
   */
  protected getCacheKey(request: Request): string {
    const { method, url } = request;
    return method + ";" + url;
  }

  /**
   * Answer with `304` when the request's `If-None-Match` matches the ETag just
   * computed, meaning the client's copy is current.
   *
   * @param context The request, response, and computed ETag.
   * @returns The context, with `done` set if a `304` was substituted.
   */
  protected handleEtagMatchesRequestIfNoneMatchHeader(
    context: Context,
  ): Context {
    if (context.done) {
      return context;
    }

    if (!context.etag) {
      return context;
    }

    if (context.request.headers.get(Header.IfNoneMatch) === context.etag) {
      // Edge case: We need to check if the etag was already cached. If we do
      // not do this, then we could end up sending a 304 for a response that
      // this middleware has not processed yet. This can happen if a client
      // sends a request with an etag (for shizz and giggles) and the response
      // to that request's etag matches. In this case, we need to send the
      // response as if it was being requested for the first time. After that,
      // we cache the etag so subsequent requests result in a 304 response.
      if (this.requestIsCached(context.request)) {
        context.response = new Response(null, {
          status: StatusCode.NotModified,
          statusText: StatusDescription.NotModified,
          headers: {
            [Header.ETag]: context.etag,
            [Header.LastModified]: this
              .#cache[this.getCacheKey(context.request)][Header.LastModified],
          },
        });

        context.done = true;
      }
    }

    return context;
  }

  /**
   * Enforce `If-Match`, which a client sends to avoid overwriting a resource that
   * changed since it last read it.
   *
   * @param request The request to check.
   * @throws {HTTPError} `412 Precondition Failed` if the cached ETag does not
   * match what the client sent.
   */
  protected handleEtagMatchesRequestIfMatchHeader(request: Request) {
    if (!this.requestIsCached(request)) {
      return;
    }

    if (!request.headers.get(Header.IfMatch)) {
      return;
    }

    const cacheKey = this.getCacheKey(request);
    const ifMatchHeader = request.headers.get(Header.IfMatch);

    // If the headers do not match, then a mid-air collision will happen if
    // we do not error out
    if (ifMatchHeader !== this.#cache[cacheKey][Header.ETag]) {
      throw new HTTPError(Status.PreconditionFailed);
    }
  }

  /**
   * Handle a response with no body, which cannot be hashed. A shared default ETag
   * stands in so empty responses still cache.
   *
   * @param context The request and response.
   * @returns The context, with `done` set if the empty-response path was taken.
   */
  protected handleIfResponseEmpty(context: Context): Context {
    if (context.done) {
      return context;
    }

    const contentLength = context.response.headers.get(Header.ContentLength);

    // This method should only handle empty responses. That is, a response with
    // no body. So gtfo if you got one.
    if (
      context.response.body ||
      (context.response.body !== null) ||
      (contentLength && contentLength !== "0")
    ) {
      return context;
    }

    let lastModified;

    // If etag is already present, then use the previous last-modified value
    if (context.request.headers.get(Header.IfNoneMatch)) {
      lastModified = this.#cache[this.#default_etag][Header.LastModified];
    } else {
      // Otherwise, create a new "Last-Modified" value
      lastModified = this.createLastModifiedHeader();
      this.#cache[this.getCacheKey(context.request)][Header.LastModified] =
        lastModified;
    }

    context.response = new Response(null, {
      status: StatusCode.NotModified,
      statusText: StatusDescription.NotModified,
      headers: {
        [Header.ETag]: this.#default_etag,
        [Header.LastModified]: lastModified,
      },
    });

    context.done = true;

    return context;
  }

  /**
   * Whether this request's URL and method have been seen before.
   *
   * @param request The request to look up.
   * @returns `true` if an entry exists.
   */
  protected requestIsCached(request: Request): boolean {
    if (this.getCacheKey(request) in this.#cache) {
      return true;
    }

    return false;
  }

  /**
   * Produce the final response, attaching the ETag unless an earlier step already
   * settled it.
   *
   * @param context The request, response, and computed ETag.
   * @returns The response to send.
   * @throws {Error} If no ETag was computed and none was expected.
   */
  protected sendResponse(context: Context): Response {
    if (context.done) {
      return context.response;
    }

    if (!context.etag) {
      throw new Error("Error generating ETag");
    }

    const newLastModifiedDate = this.createLastModifiedHeader();
    this.#cache[this.getCacheKey(context.request)] = {
      [Header.ETag]: context.etag,
      [Header.LastModified]: newLastModifiedDate,
    };

    const responseStatusCode = context.response.status;
    let status: ResponseStatus = Status.OK;

    for (const [name, statusCode] of Object.entries(StatusCode)) {
      if (responseStatusCode === statusCode) {
        status = Status[name as ResponseStatusName];
      }
    }

    return new Response(context.response.body, {
      status: status.code,
      statusText: status.description,
      headers: {
        [Header.ETag]: context.etag,
        [Header.LastModified]: newLastModifiedDate,
      },
    });
  }
}

/**
 * Get the middleware class that handles ETag and ETag-related headers.
 *
 * @param options (Optional) Options to control the middleware's behavior. See
 * {@link Options} for details.
 *
 * @returns The middleware class that can be instantiated. When it is
 * instantiated, it instantiates with the provided `options`. If no options are
 * provided, it uses its default options.
 */
function ETag(options: Options = defaultOptions): new () => ETagMiddleware {
  return class DefaultETagMiddleware extends ETagMiddleware {
    constructor() {
      super(options);
    }
  };
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { defaultOptions, ETag, ETagMiddleware, type Options };
