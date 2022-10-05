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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestHandler =
  exports.Errors =
  exports.Enums =
  exports.Resource =
  exports.ErrorHandler =
    void 0;
const request_handler_js_1 = require(
  "././src/node/handlers/request_handler.js",
);
const Interfaces = __importStar(require("./src/core/interfaces.js"));
const Types = __importStar(require("./src/core/types.js"));
var error_handler_js_1 = require("./src/core/handlers/error_handler.js");
Object.defineProperty(exports, "ErrorHandler", {
  enumerable: true,
  get: function () {
    return error_handler_js_1.ErrorHandler;
  },
});
var resource_js_1 = require("./src/node/http/resource.js");
Object.defineProperty(exports, "Resource", {
  enumerable: true,
  get: function () {
    return resource_js_1.Resource;
  },
});
exports.Enums = __importStar(require("./src/core/enums.js"));
exports.Errors = __importStar(require("./src/core/http/errors.js"));
/**
 * Create a request handler to route `Request` objects through.
 *
 * @param options See `Types.RequestHandlerOptions`.
 * @returns An instance of Drash's `RequestHandler`.
 */
function createRequestHandler(options) {
  return __awaiter(this, void 0, void 0, function* () {
    const r = new request_handler_js_1.RequestHandler(options);
    yield r.runServicesAtStartup();
    // @ts-ignore: Need Node interface
    return r;
  });
}
exports.createRequestHandler = createRequestHandler;
//# sourceMappingURL=mod.js.map
