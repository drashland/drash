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
import { HTTPError } from "../../../core/errors/HTTPError.ts";
import { Middleware } from "../../../standard/http/Middleware.ts";

type Options = {
  /** Throw if the response's Content-Type header does not match the request's Accept header? */
  throw_if_accept_header_mismatched?: boolean;
  /** Throw if the request's Accept header is missing? */
  throw_if_accept_header_missing?: boolean;
};

type Context = {
  request: Request;
  response: Response;
  /** A flag each handler function can use to see if it should or should not process the context further. */
  done?: boolean;
};

const defaultOptions: Options = {
  throw_if_accept_header_mismatched: true,
  throw_if_accept_header_missing: true,
};

class AcceptHeaderMiddleware extends Middleware {
  #options: Options;

  /**
   * Construct the middleware that handles Accept headers.
   *
   * @param options (Optional) Options to control the middleware's behavior. See
   * {@link Options} for details.
   */
  constructor(options: Options = defaultOptions) {
    super();

    // TODO(crookse) Check if the options are correct before setting them
    this.#options = {
      ...defaultOptions,
      ...options,
    };
  }

  public ALL(request: Request) {
    return Promise
      .resolve()
      .then(() => this.handleIfAcceptHeaderMissing(request))
      .then(() => super.next<Response>(request))
      .then((response) => ({ request, response }))
      .then((context) => this.handleHeaders(context))
      .then((context) => this.sendResponse(context));
  }

  protected handleHeaders(context: Context) {
    if (context.done) {
      return context;
    }

    const reqHeader = context.request.headers.get("accept")?.toLowerCase();

    // Request accepts anything so send it
    if (reqHeader && reqHeader.includes("*/*")) {
      context.done = true;
      return context;
    }

    const resHeader = context.response.headers.get("content-type")
      ?.toLowerCase();

    if (!resHeader) {
      throw new HTTPError(
        Status.InternalServerError,
        "The server did not generate a response with a Content-Type header",
      );
    }

    const [contentType, _charset] = resHeader.split(";");

    if (
      (reqHeader !== resHeader) ||
      !reqHeader.includes(contentType)
    ) {
      // Only throw if the option is enabled
      if (this.#options.throw_if_accept_header_mismatched) {
        throw new HTTPError(
          Status.UnprocessableEntity,
          "The server did not generate a response matching the request's Accept header",
        );
      }
    }

    context.done = true;

    return context;
  }

  protected handleIfAcceptHeaderMissing(request: Request) {
    if (
      this.#options.throw_if_accept_header_missing &&
      !request.headers.get("accept")
    ) {
      throw new HTTPError(
        Status.BadRequest,
        `Accept header is required`,
      );
    }
  }

  protected sendResponse(context: Context) {
    return context.response;
  }
}

/**
 * Get the middleware class that handles Accept headers.
 *
 * @param options (Optional) Options to control the middleware's behavior. See
 * {@link Options} for details.
 *
 * @returns The middleware class that can be instantiated. When it is
 * instantiated, it instantiates with the provided `options`. If no options are
 * provided, it uses its default options.
 */
function AcceptHeader(options: Options = defaultOptions) {
  return new AcceptHeaderMiddleware(options);
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { AcceptHeader, AcceptHeaderMiddleware, defaultOptions, type Options };
