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
var _AbstractResourceHandler_instances,
  _AbstractResourceHandler_buildMethodChains;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractResourceHandler = void 0;
const chain_handler_js_1 = require("./chain_handler.js");
const enums_js_1 = require("../../enums.js");
const services_handler_js_1 = require("../services_handler.js");
/**
 * Class that handles requests that have made it to an existing resource. This
 * class ensures requests run through the chains defined by the `Resource` (see
 * `this#original`). Resource's can have multiple chains -- one for each HTTP
 * method they define; and each of those chains can have services.
 */
class AbstractResourceHandler extends chain_handler_js_1.ChainHandler {
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  /**
   * @param ResourceClass - See {@link Resource}.
   */
  constructor(ResourceClass) {
    var _a;
    super();
    _AbstractResourceHandler_instances.add(this);
    this.method_chains = {
      CONNECT: [],
      DELETE: [],
      GET: [],
      HEAD: [],
      OPTIONS: [],
      PATCH: [],
      POST: [],
      PUT: [],
      TRACE: [],
    };
    this.original = new ResourceClass();
    this.services_all_handler = new services_handler_js_1.ServicesHandler(
      (_a = this.original.services.ALL) !== null && _a !== void 0 ? _a : [],
    );
    this.original_url_patterns = this.getOriginalUrlPatterns();
    __classPrivateFieldGet(
      this,
      _AbstractResourceHandler_instances,
      "m",
      _AbstractResourceHandler_buildMethodChains,
    ).call(this);
  }
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  handle(context) {
    // @ts-ignore
    if (context.request.end_early) {
      return;
    }
    // @ts-ignore: TODO(crookse): Need to make sure we have a Request interface
    const httpMethod = context.request.method;
    return super.runMethodChain(context, this.method_chains[httpMethod]);
  }
}
exports.AbstractResourceHandler = AbstractResourceHandler;
_AbstractResourceHandler_instances = new WeakSet(),
  _AbstractResourceHandler_buildMethodChains =
    function _AbstractResourceHandler_buildMethodChains() {
      var _a;
      for (const httpMethod of Object.values(enums_js_1.Method)) {
        // Add the "ALL" services that run before the HTTP method
        if (this.services_all_handler.hasServices("runBeforeResource")) {
          this.method_chains[httpMethod].push(
            this.services_all_handler.runBeforeResourceServices.bind(
              this.services_all_handler,
            ),
          );
        }
        // Create the HTTP method's service handler. Each HTTP method has its own
        // service handler because a resource can define HTTP method level
        // services.
        const services = new services_handler_js_1.ServicesHandler(
          (_a = this.original.services[httpMethod]) !== null && _a !== void 0
            ? _a
            : [],
        );
        // Add the services that run before the HTTP method
        if (services.hasServices("runBeforeResource")) {
          this.method_chains[httpMethod].push((context) =>
            services.runBeforeResourceServices(context)
          );
        }
        // Add the HTTP method
        this.method_chains[httpMethod].push((context) => {
          // @ts-ignore
          if (context.request.end_early) {
            return;
          }
          const resourceHttpMethod = this.original[httpMethod];
          if (!resourceHttpMethod) {
            return;
          }
          return Promise
            .resolve(
              resourceHttpMethod.bind(this.original)(
                context.request,
                context.response,
              ),
            )
            .then(() => {
              // @ts-ignore
              if (context.response.error_init) {
                // @ts-ignore
                throw context.response.error_init;
              }
              // @ts-ignore
              if (context.request.end_early) {
                return;
              }
            });
        });
        // Add the services that run after the HTTP method
        if (services.hasServices("runAfterResource")) {
          this.method_chains[httpMethod].push(
            services.runAfterResourceServices.bind(services),
          );
        }
        // Add the "ALL" services that run before the HTTP method
        if (this.services_all_handler.hasServices("runAfterResource")) {
          this.method_chains[httpMethod].push(
            this.services_all_handler.runAfterResourceServices.bind(
              this.services_all_handler,
            ),
          );
        }
      }
    };
//# sourceMappingURL=resource_handler.js.map
