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

import { StatusCode } from "../enums.ts";
import { StatusCodeRegistry } from "../http/status_code_registry.ts";
import * as Errors from "../http/errors.ts";
import * as Interfaces from "../interfaces.ts";
import * as Types from "../types.ts";

/**
 * The default error handler. This class can be extended and provided to a
 * `RequestHandler`'s options. If no error handler is provided, the
 * `RequestHandler` will create one using this class. If an error handler is
 * provided, but it errors out when handling an error, the `RequestHandler` will
 * use this class as a fallback so errors are handled in Drash instead of the
 * runtime.
 */
export class ErrorHandler<RequestType>
  implements Interfaces.ErrorHandler<RequestType> {
  // FILE MARKER - METHODS - PUBLIC (EXPOSED) //////////////////////////////////

  public handle(
    context: Types.ErrorHandlerContext<RequestType>,
  ): Types.Promisable<Interfaces.ResponseBuilder | void> {
    const ret = new Errors.HttpError(StatusCode.InternalServerError);

    // Retype the error to have a code so we can check if it has a code
    const errorWithCode = (context.error as unknown as { code: number });

    // If the error has a code and that code is a proper status code, then
    // assign it as the code
    if (
      errorWithCode.code &&
      typeof errorWithCode.code === "number" &&
      StatusCodeRegistry.has(errorWithCode.code as StatusCode)
    ) {
      ret.code = errorWithCode.code;
    }

    if (context.error?.message) {
      ret.message = context.error.message;
    }

    return context.response
      .text(ret.stack ?? ret.message)
      .status(ret.code);
  }
}
