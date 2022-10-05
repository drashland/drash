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
import * as Interfaces from "../interfaces.js";
import * as Types from "../types.js";
/**
 * A wrapper around the error handler class that users can provide. If not
 * provided, then the {@link ErrorHandler} class is used. This proxy exists to
 * ensure that the default {@link ErrorHandler} can be used as a fallback if a
 * user-defiend error handler class is defined and errors outs.
 */
export declare class ErrorHandlerProxy<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> implements
  Interfaces.ErrorHandler<
    GenericRequest,
    GenericResponse,
    GenericResponseBody,
    GenericResponseBuilder
  > {
  #private;
  /**
   * @param ErrorHandlerClass - See {@link Types.ErrorHandlerClass}.
   */
  constructor(
    ErrorHandlerClass: Types.ErrorHandlerClass<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >,
  );
  /**
   * Handle the error thrown in the lifecycle context.
   * @param context - See {@link Types.ContextForRequest}.
   * @returns The response if needed by the caller.
   */
  handle(
    context: Types.ErrorHandlerContext<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >,
  ): Types.Promisable<GenericResponseBuilder | void>;
}
