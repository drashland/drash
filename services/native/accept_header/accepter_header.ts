/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
 * Copyright (C) 2022  Drash authors. The Drash authors are listed in the
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

import { Enums, Errors, Request, Response } from "../../../mod.deno.ts";

type Options = {
  /**
   * (Optional. Defaults to `false`) Should requests fail when a request's
   * `Accept` header does not accept a response's `Content-Type` header?
   */
  fail_on_accept_header_mismatch: boolean;
};

/**
 * Class that handles checking a request's `Accept` header and a response's
 * `Content-Type` header to further build a response that makes sense for the
 * client.
 */
export class AcceptHeaderService {
  #options: Options = {
    fail_on_accept_header_mismatch: false,
  };

  constructor(options: Options) {
    this.#options = Object.assign(this.#options, options ?? {});
  }

  runAfterResource(request: Request, response: Response): void {
    const result = this.#requestAcceptsResponse(request, response);

    if (!result && this.#options.fail_on_accept_header_mismatch) {
      throw new Errors.HttpError(
        Enums.StatusCode.UnprocessableEntity,
        "The server cannot produce a response matching the list of acceptable values defined in the request's proactive content negotiation headers and the server is unwilling to supply a default representation.",
      );
    }
  }

  /**
   * If the request Accept header is present, then make sure the response
   * Content-Type header is accepted.
   *
   * @param requestAcceptHeader
   * @param responseContentTypeHeader
   */
  #requestAcceptsResponse(request: Request, response: Response): boolean {
    const requestAcceptHeader = request.headers.get("accept");

    if (!requestAcceptHeader) {
      return false;
    }

    const responseContentTypeHeader = response.headers?.get("content-type");

    if (!responseContentTypeHeader) {
      return false;
    }

    if (requestAcceptHeader.includes("*/*")) {
      return true;
    }

    if (requestAcceptHeader.includes(responseContentTypeHeader)) {
      return true;
    }

    return false;
  }
}
