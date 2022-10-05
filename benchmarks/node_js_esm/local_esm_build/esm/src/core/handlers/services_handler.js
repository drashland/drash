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
var __awaiter = (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function (resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
var _ServicesHandler_instances,
  _ServicesHandler_services,
  _ServicesHandler_setServices;
/**
 * Base class for services handlers.
 */
export class ServicesHandler {
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  /**
   * @param services - An array of services this instance can run.
   */
  constructor(services) {
    _ServicesHandler_instances.add(this);
    _ServicesHandler_services.set(this, {
      runAfterResource: [],
      runAtStartup: [],
      runBeforeResource: [],
      runOnError: [],
    });
    __classPrivateFieldGet(
      this,
      _ServicesHandler_instances,
      "m",
      _ServicesHandler_setServices,
    ).call(this, services !== null && services !== void 0 ? services : []);
  }
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  /**
   * Does this service handler have methods of the given `method` defined?
   * @param method - See {@link Types.ServiceMethod}.
   * @returns True if yes, false if no.
   */
  hasServices(method) {
    return !!__classPrivateFieldGet(
      this,
      _ServicesHandler_services,
      "f",
    )[method].length;
  }
  /**
   * Run all services that have `runAfterResource` method defined.
   * @param context - See {@link Types.ContextForRequest}.
   */
  runAfterResourceServices(context) {
    return __awaiter(this, void 0, void 0, function* () {
      const internalRequest =
        // @ts-ignore
        context.request;
      for (
        const service of __classPrivateFieldGet(
          this,
          _ServicesHandler_services,
          "f",
        ).runAfterResource
      ) {
        if (internalRequest.end_early) {
          return;
        }
        yield service.runAfterResource(context.request, context.response);
      }
    });
  }
  /**
   * Run all services that have `runBeforeResource` method defined.
   * @param context - See {@link Types.ContextForRequest}.
   */
  runBeforeResourceServices(context) {
    return __awaiter(this, void 0, void 0, function* () {
      const internalRequest =
        // @ts-ignore
        context.request;
      for (
        const service of __classPrivateFieldGet(
          this,
          _ServicesHandler_services,
          "f",
        ).runBeforeResource
      ) {
        if (internalRequest.end_early) {
          return;
        }
        yield service.runBeforeResource(context.request, context.response);
      }
    });
  }
  /**
   * Run all services that have the `runOnError` method defined.
   * @param context
   */
  runOnErrorServices(context) {
    return __awaiter(this, void 0, void 0, function* () {
      for (
        const service of __classPrivateFieldGet(
          this,
          _ServicesHandler_services,
          "f",
        ).runOnError
      ) {
        yield service.runOnError(context.request, context.response);
      }
    });
  }
  /**
   * Run all services that have `runAtStartup` method defined.
   * @param context - See {@link Types.ContextForRequest}.
   */
  runStartupServices(context) {
    return __awaiter(this, void 0, void 0, function* () {
      for (
        const service of __classPrivateFieldGet(
          this,
          _ServicesHandler_services,
          "f",
        ).runAtStartup
      ) {
        yield service.runAtStartup(context);
      }
    });
  }
}
_ServicesHandler_services = new WeakMap(),
  _ServicesHandler_instances = new WeakSet(),
  _ServicesHandler_setServices = function _ServicesHandler_setServices(
    services,
  ) {
    const methods = [
      "runAfterResource",
      "runAtStartup",
      "runBeforeResource",
      "runOnError",
    ];
    for (const method of methods) {
      for (const service of services) {
        if (method in service) {
          __classPrivateFieldGet(this, _ServicesHandler_services, "f")[method]
            .push(service);
        }
      }
    }
  };
//# sourceMappingURL=services_handler.js.map
