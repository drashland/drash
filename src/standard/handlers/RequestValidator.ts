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

// Imports > Core
import { HTTPError } from "../../core/errors/HTTPError.ts";
import { StatusCode } from "../../core/http/response/StatusCode.ts";

// Imports > Standard
import { ConsoleLogger, Level } from "../log/ConsoleLogger.ts";
import { Handler } from "./Handler.ts";

type Input = {
  method: string;
  url: string;
};

class RequestValidator<
  I extends Input = Input,
> extends Handler<unknown, Promise<unknown>> {
  handle(request: I): Promise<unknown> {
    return Promise
      .resolve()
      .then(() => this.#validate(request))
      .then(() => {
        if (this.next_handler) {
          return super.nextHandler(request);
        }

        return request;
      });
  }

  #validate(request: unknown): void {
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
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Input, RequestValidator };
