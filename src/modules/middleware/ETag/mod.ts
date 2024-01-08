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

import { Header } from "../../../core/http/Header.ts";
import { Middleware } from "../../../standard/http/Middleware.ts";
import { response } from "./ETagResponse.ts";
import { ResponseStatus, ResponseStatusName } from "../../../core/Types.ts";
import { Status } from "../../../core/http/response/Status.ts";
import { StatusCode } from "../../../core/http/response/StatusCode.ts";
import { StatusDescription } from "../../../core/http/response/StatusDescription.ts";
import { HTTPError } from "../../../core/errors/HTTPError.ts";

type Options = {
  /** The maximum length of the ETag header. */
  etag_max_length?: number;
  /** Add the "W/" directive to all generated ETag headers? */
  weak?: boolean;
};

type Context = {
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

const defaultOptions: Options = {
  etag_max_length: 27,
  weak: false,
};

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

  public ALL(request: Request): Promise<Response> {
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
  protected createEtagHeader(context: Context) {
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

  protected createLastModifiedHeader() {
    return new Date().toUTCString();
  }

  protected getCacheKey(request: Request) {
    const { method, url } = request;
    return method + ";" + url;
  }

  protected handleEtagMatchesRequestIfNoneMatchHeader(context: Context) {
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
      // sends a request with an etag (for shits and giggles) and the response
      // to that request's etag matches. In this case, we need to send the
      // repsonse as if it was being requested for the first time. After that,
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

  protected handleIfResponseEmpty(context: Context) {
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

  protected requestIsCached(request: Request) {
    if (this.getCacheKey(request) in this.#cache) {
      return true;
    }

    return false;
  }

  protected sendResponse(context: Context) {
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
function ETag(options: Options = defaultOptions) {
  return class DefaultETagMiddleware extends ETagMiddleware {
    constructor() {
      super(options);
    }
  };
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { defaultOptions, ETag, ETagMiddleware, type Options };
