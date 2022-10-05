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
exports.AbstractRequestHandler = void 0;
const chain_handler_js_1 = require("./chain_handler.js");
const error_handler_js_1 = require("../error_handler.js");
const error_handler_proxy_js_1 = require(
  "../../proxies/error_handler_proxy.js",
);
const errors_js_1 = require("../../http/errors.js");
const services_handler_js_1 = require("../services_handler.js");
const Enums = __importStar(require("../../enums.js"));
/**
 * This class handles the entire request-resource-response lifecycle. It is in
 * charge of (not limited to) passing an incoming request through the lifecycle,
 * filtering requests, running middleware on requests, and returning a response
 * from the resource that matches the request.
 * @template GenericRequest The incoming request.
 * @template GenericResponse The outgoing response.
 */
class AbstractRequestHandler extends chain_handler_js_1.ChainHandler {
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  /**
   * @param options - See {@link Types.RequestHandlerOptions}.
   */
  constructor(options) {
    var _a, _b, _c;
    super();
    this.method_chain = [];
    /**
     * Key-value store where the key is the resource name and the value is the
     * resource proxy. This is populated at compile time and referenced only on
     * first requests to a resource. Subsequent requests will be forwarded to
     * reference `this.#resources_cached` for the resource.
     */
    this.resource_handlers = {};
    /**
     * Key-value store where the key is a request URL and the value is the
     * resource proxy that was matched to it.
     *
     * @see {@link Types.CachedResource} for cached resource schema.
     */
    this.resource_handlers_cached = {};
    this.services_handler = new services_handler_js_1.ServicesHandler(
      (_a = options === null || options === void 0
            ? void 0
            : options.services) !== null && _a !== void 0
        ? _a
        : [],
    );
    // @ts-ignore
    this.error_handler = new error_handler_proxy_js_1.ErrorHandlerProxy(
      // @ts-ignore
      (_b = options === null || options === void 0
            ? void 0
            : options.error_handler) !== null && _b !== void 0
        ? _b
        : error_handler_js_1.ErrorHandler,
    );
    this.addResources(
      (_c = options === null || options === void 0
            ? void 0
            : options.resources) !== null && _c !== void 0
        ? _c
        : [],
    );
    this.buildMethodChain();
  }
  addResources(resources) {
    resources.forEach((resourceClass) => {
      this.addResourceHandler(resourceClass);
    });
  }
  // @ts-ignore
  handle(incomingRequest) {
    const context = this.createContext(incomingRequest);
    return Promise
      .resolve()
      .then(() => this.matchRequestToResourceHandler(context))
      .then(() => super.runMethodChain(context, this.method_chain))
      .then(() => (context) => {
        var _a;
        return (_a = context.resource_handler) === null || _a === void 0
          ? void 0
          : _a.handle(context);
      })
      .catch((e) => this.runErrorHandler(context, e))
      // @ts-ignore
      .then(() => context.response.build());
  }
  // FILE MARKER - METHODS - PUBLIC (HIDDEN) ///////////////////////////////////
  /**
   * When creating an object of this class, there needs to be a way to run
   * services at startup time. This is why this method exists (so it can be
   * called when the request handler is instantiated in `mod.ts`).
   */
  runServicesAtStartup() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.services_handler.hasServices("runAtStartup")) {
        yield this.services_handler.runStartupServices({
          request_handler: this,
        });
      }
    });
  }
  /**
   * Build this handler's chain.
   */
  buildMethodChain() {
    // Run all "global before resource" services
    if (this.services_handler.hasServices("runBeforeResource")) {
      this.method_chain.push((context) => {
        return this.services_handler.runBeforeResourceServices(context);
      });
    }
    // Run the resource handler
    this.method_chain.push((context) => {
      var _a;
      // @ts-ignore
      if (context.request.end_early) {
        return;
      }
      return (_a = context.resource_handler) === null || _a === void 0
        ? void 0
        : _a.handle(context);
    });
    // Run all "global after resource" services
    if (this.services_handler.hasServices("runAfterResource")) {
      this.method_chain.push((context) => {
        return this.services_handler.runAfterResourceServices(context);
      });
    }
  }
  /**
   * In the event an error occurs in the chain, this method is called to handle
   * the context and further process a proper `Response` for the client.
   * @param context
   * @param error
   * @returns
   */
  runErrorHandler(context, error) {
    context.error = error !== null && error !== void 0
      ? error
      : new errors_js_1.HttpError(Enums.StatusCode.InternalServerError);
    return Promise
      .resolve()
      .then(() =>
        this.error_handler.handle({
          error: context.error,
          response: context.response,
          request: context.request,
        })
      )
      .then(() => {
        if (this.services_handler.hasServices("runOnError")) {
          return this.services_handler.runOnErrorServices(context);
        }
      });
  }
}
exports.AbstractRequestHandler = AbstractRequestHandler;
//# sourceMappingURL=request_handler.js.map
