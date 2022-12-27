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

import { ErrorHandler } from "../Handlers/ErrorHandler.ts";
import { HTTPError } from "../Errors/HTTPError.ts";
import * as Interfaces from "../Interfaces.ts";
import * as Types from "../Types.ts";

/**
 * A wrapper around the error handler class that users can provide. If not
 * provided, then the {@link ErrorHandler} class is used. This proxy exists to
 * ensure that the default {@link ErrorHandler} can be used as a fallback if a
 * user-defiend error handler class is defined and errors outs.
 */
export class ErrorHandlerProxy implements Interfaces.ErrorHandler {
  /**
   * The original error handler. This is mainly used if a user-defined error
   * handler is provided by the `RequestHandler`. If not, then this gets
   * assigned the default error handler -- {@link ErrorHandler}.
   */
  #original: Interfaces.ErrorHandler;

  /**
   * In case running the original fails, this error handler is used.
   */
  #fallback: ErrorHandler = new ErrorHandler();

  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////

  /**
   * @param ErrorHandlerClass - See {@link Types.ErrorHandlerClass}.
   */
  constructor(
    ErrorHandlerClass: Types.ErrorHandlerClass,
  ) {
    this.#original = new ErrorHandlerClass();
  }

  // FILE MARKER - PUBLIC //////////////////////////////////////////////////////

  /**
   * Handle the error thrown in the lifecycle context.
   * @param context - See {@link Types.ContextForRequest}.
   * @returns The response if needed by the caller.
   */
  public handle(
    context: Types.ErrorHandlerContext,
  ): Types.Promisable<Response> {
    if (!context.error) {
      context.error = new HTTPError(500);
    }

    return this.#runOriginal(context);
  }

  // FILE MARKER - PRIVATE /////////////////////////////////////////////////////

  /**
   * In case running the original fails (e.g., it throws an error itself), use
   * the fallback error handler as a backup.
   * @param context - See {@link Types.ContextForRequest}.
   * @returns The response if needed by the caller.
   */
  #runFallback(
    context: Types.ErrorHandlerContext,
  ): Types.Promisable<Response> {
    return this.#fallback.handle({
      error: context.error,
      request: context.request,
    });
  }

  /**
   * Run the original.
   * @param context - See {@link Types.ContextForRequest}.
   * @returns The response if needed by the caller.
   */
  #runOriginal(
    context: Types.ErrorHandlerContext,
  ): Types.Promisable<Response> {
    // Errors can be thrown inside an error handler that was passed in by a
    // user. In order to catch it, we need a regular try-catch block instead of
    // using a `.catch()` Promise block.
    try {
      return this.#original.handle({
        error: context.error ?? new HTTPError(StatusCode.InternalServerError),
        request: context.request,
      });
    } catch (error) {
      context.error = error;
    }

    return this.#runFallback(context);
  }
}
