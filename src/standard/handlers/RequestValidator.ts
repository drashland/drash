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

// Imports > Core
import { AbstractHandler } from "../../core/handlers/AbstractHandler.ts";
import { HTTPError } from "../../core/errors/HTTPError.ts";
import { Status } from "../../core/http/Status.ts";

// Imports > Standard
import { GroupConsoleLogger } from "../log/GroupConsoleLogger.ts";

class RequestValidator<I> extends AbstractHandler {
  #logger = GroupConsoleLogger.create("RequestValidator");

  handle(request: I): void {
    this.#logger.debug(`Validating request`);

    if (!request) {
      throw new HTTPError(
        Status.UnprocessableEntity.Code,
        `Request could not be read`,
      );
    }

    if (typeof request !== "object") {
      throw new HTTPError(
        Status.UnprocessableEntity.Code,
        `Request could not be read`,
      );
    }

    if (!("method" in request)) {
      throw new HTTPError(
        Status.UnprocessableEntity.Code,
        `Request HTTP method could not be read`,
      );
    }

    if (!("url" in request)) {
      throw new HTTPError(
        Status.UnprocessableEntity.Code,
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
