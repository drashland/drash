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

// Imports > Standard
import { ConsoleLogger, Level } from "../../log/ConsoleLogger.ts";
import { Handler } from "../Handler.ts";
import { HTTPError } from "../../errors/HTTPError.ts";
import { StatusCode } from "../../http/response/StatusCode.ts";

class RequestValidator<O extends unknown> extends Handler<Promise<O>> {
  #logger = ConsoleLogger.create("RequestValidator", Level.Off);

  handle(request: unknown): Promise<O> {
    this.#logger.debug(`Request received`);

    return Promise
      .resolve()
      .then(() => this.#validate(request))
      .then(() => super.handle(request));
  }

  #validate(request: unknown): void {
    this.#logger.debug(`Validating request`);

    if (!request) {
      throw new HTTPError(
        StatusCode.UnprocessableEntity,
        `Request could not be read`,
      );
    }

    if (typeof request !== "object") {
      throw new HTTPError(
        StatusCode.UnprocessableEntity,
        `Request could not be read`,
      );
    }

    if (!("method" in request) || typeof request.method !== "string") {
      throw new HTTPError(
        StatusCode.UnprocessableEntity,
        `Request HTTP method could not be read`,
      );
    }

    if (!("url" in request) || typeof request.url !== "string") {
      throw new HTTPError(
        StatusCode.UnprocessableEntity,
        `Request URL could not be read`,
      );
    }

    this.#logger.trace(
      `Request validated - method: {}; url: {}`,
      request.method,
      request.url,
    );
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { RequestValidator };
