"use strict";
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
var __createBinding = (this && this.__createBinding) ||
  (Object.create
    ? (function (o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (
        !desc ||
        ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
      ) {
        desc = {
          enumerable: true,
          get: function () {
            return m[k];
          },
        };
      }
      Object.defineProperty(o, k2, desc);
    })
    : (function (o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
    }));
var __setModuleDefault = (this && this.__setModuleDefault) ||
  (Object.create
    ? (function (o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    })
    : function (o, v) {
      o["default"] = v;
    });
var __importStar = (this && this.__importStar) || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod) {
      if (
        k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)
      ) __createBinding(result, mod, k);
    }
  }
  __setModuleDefault(result, mod);
  return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const enums_js_1 = require("../enums.js");
const status_code_registry_js_1 = require("../http/status_code_registry.js");
const Errors = __importStar(require("../http/errors.js"));
/**
 * The default error handler. This class can be extended and provided to a
 * `RequestHandler`'s options. If no error handler is provided, the
 * `RequestHandler` will create one using this class. If an error handler is
 * provided, but it errors out when handling an error, the `RequestHandler` will
 * use this class as a fallback so errors are handled in Drash instead of the
 * runtime.
 */
class ErrorHandler {
  // FILE MARKER - METHODS - PUBLIC (EXPOSED) //////////////////////////////////
  handle(context) {
    var _a, _b;
    const ret = new HTTPError(enums_js_1.StatusCode.InternalServerError);
    // Retype the error to have a code so we can check if it has a code
    const errorWithCode = context.error;
    // If the error has a code and that code is a proper status code, then
    // assign it as the code
    if (
      errorWithCode.code &&
      typeof errorWithCode.code === "number" &&
      status_code_registry_js_1.StatusCodeRegistry.has(errorWithCode.code)
    ) {
      ret.code = errorWithCode.code;
    }
    if ((_a = context.error) === null || _a === void 0 ? void 0 : _a.message) {
      ret.message = context.error.message;
    }
    return context.response
      .text((_b = ret.stack) !== null && _b !== void 0 ? _b : ret.message)
      .status(ret.code);
  }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=error_handler.js.map
