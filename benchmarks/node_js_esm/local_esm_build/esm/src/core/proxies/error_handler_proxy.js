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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) ||
  function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) {
      throw new TypeError("Private accessor was defined without a setter");
    }
    if (
      typeof state === "function"
        ? receiver !== state || !f
        : !state.has(receiver)
    ) {
      throw new TypeError(
        "Cannot write private member to an object whose class did not declare it",
      );
    }
    return (kind === "a"
      ? f.call(receiver, value)
      : f
      ? f.value = value
      : state.set(receiver, value)),
      value;
  };
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) ||
  function (receiver, state, kind, f) {
    if (kind === "a" && !f) {
      throw new TypeError("Private accessor was defined without a getter");
    }
    if (
      typeof state === "function"
        ? receiver !== state || !f
        : !state.has(receiver)
    ) {
      throw new TypeError(
        "Cannot read private member from an object whose class did not declare it",
      );
    }
    return kind === "m"
      ? f
      : kind === "a"
      ? f.call(receiver)
      : f
      ? f.value
      : state.get(receiver);
  };
var _ErrorHandlerProxy_instances,
  _ErrorHandlerProxy_original,
  _ErrorHandlerProxy_fallback,
  _ErrorHandlerProxy_runFallback,
  _ErrorHandlerProxy_runOriginal;
import { ErrorHandler } from "../handlers/error_handler.js";
import { HTTPError } from "../http/errors.js";
import { StatusCode } from "../enums.js";
/**
 * A wrapper around the error handler class that users can provide. If not
 * provided, then the {@link ErrorHandler} class is used. This proxy exists to
 * ensure that the default {@link ErrorHandler} can be used as a fallback if a
 * user-defiend error handler class is defined and errors outs.
 */
export class ErrorHandlerProxy {
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  /**
   * @param ErrorHandlerClass - See {@link Types.ErrorHandlerClass}.
   */
  constructor(ErrorHandlerClass) {
    _ErrorHandlerProxy_instances.add(this);
    /**
     * The original error handler. This is mainly used if a user-defined error
     * handler is provided by the `RequestHandler`. If not, then this gets
     * assigned the default error handler -- {@link ErrorHandler}.
     */
    _ErrorHandlerProxy_original.set(this, void 0);
    /**
     * In case running the original fails, this error handler is used.
     */
    _ErrorHandlerProxy_fallback.set(this, new ErrorHandler());
    __classPrivateFieldSet(
      this,
      _ErrorHandlerProxy_original,
      new ErrorHandlerClass(),
      "f",
    );
  }
  // FILE MARKER - PUBLIC //////////////////////////////////////////////////////
  /**
   * Handle the error thrown in the lifecycle context.
   * @param context - See {@link Types.ContextForRequest}.
   * @returns The response if needed by the caller.
   */
  handle(context) {
    if (!context.error) {
      context.error = new HTTPError(500);
    }
    return __classPrivateFieldGet(
      this,
      _ErrorHandlerProxy_instances,
      "m",
      _ErrorHandlerProxy_runOriginal,
    ).call(this, context);
  }
}
_ErrorHandlerProxy_original = new WeakMap(),
  _ErrorHandlerProxy_fallback = new WeakMap(),
  _ErrorHandlerProxy_instances = new WeakSet(),
  _ErrorHandlerProxy_runFallback = function _ErrorHandlerProxy_runFallback(
    context,
  ) {
    return __classPrivateFieldGet(this, _ErrorHandlerProxy_fallback, "f")
      .handle({
        error: context.error,
        request: context.request,
        response: context.response,
      });
  },
  _ErrorHandlerProxy_runOriginal = function _ErrorHandlerProxy_runOriginal(
    context,
  ) {
    var _a;
    // Errors can be thrown inside an error handler that was passed in by a
    // user. In order to catch it, we need a regular try-catch block instead of
    // using a `.catch()` Promise block.
    try {
      return __classPrivateFieldGet(this, _ErrorHandlerProxy_original, "f")
        .handle({
          error: (_a = context.error) !== null && _a !== void 0
            ? _a
            : new HTTPError(StatusCode.InternalServerError),
          request: context.request,
          response: context.response,
        });
    } catch (error) {
      context.error = error;
    }
    return __classPrivateFieldGet(
      this,
      _ErrorHandlerProxy_instances,
      "m",
      _ErrorHandlerProxy_runFallback,
    ).call(this, context);
  };
//# sourceMappingURL=ErrorHandlerProxy.js.map
