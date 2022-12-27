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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestHandler = void 0;
// Imports from /core/common
const request_handler_js_1 = require(
  "../../core/handlers/abstract/request_handler.js",
);
const errors_js_1 = require("../../core/http/errors.js");
const enums_js_1 = require("../../core/enums.js");
// Imports from /core/node
const request_js_1 = require("../http/request.js");
const resource_handler_js_1 = require("./resource_handler.js");
/**
 * This class handles the entire request-resource-response lifecycle. It is in
 * charge of (not limited to) passing an incoming request through the lifecycle,
 * filtering requests, running middleware on requests, and returning a response
 * from the resource that matches the request.
 */
class RequestHandler extends request_handler_js_1.AbstractRequestHandler {
  // FILE MARKER - METHODS - PUBLIC (EXPOSED) //////////////////////////////////
  /**
   * Take the request in the given context and match its URL to a resource
   * handler. When matched, the `context.resource_handler` is set. If the
   * request's URL does not match with any resource handler (that is, the
   * request's URL does not match with any `paths` property in any resource),
   * then a `404 Not Found` error is thrown.
   * @param context - See {@link CoreTypes.ContextForRequest}.
   */
  matchRequestToResourceHandler(context) {
    // @ts-ignore: TODO(crookse): Need to make sure we have a Request interface
    const requestUrl = context.request.url;
    // If the resource was cached, then return it. No need to look for it again.
    if (this.resource_handlers_cached[requestUrl]) {
      const handler = this.resource_handlers_cached[requestUrl];
      context.resource_handler = handler;
      context.request.resource_handler = handler;
      return;
    }
    // @ts-ignore
    const url = new URL(requestUrl, `http://${context.request.headers.host}`);
    for (const resourceConstructorName in this.resource_handlers) {
      const resourceHandler = this.resource_handlers[resourceConstructorName];
      const patterns = resourceHandler
        .getOriginalUrlPatterns();
      for (const pattern of patterns) {
        const matchArray = url.pathname.match(pattern.regex_path);
        // If the request URL and result matched, then we know this result that
        // we are currently parsing contains the resource we are looking for
        if (matchArray) {
          const handler = this.resource_handlers[resourceConstructorName];
          this.resource_handlers_cached[requestUrl] = handler;
          context.request.setResourceHandler(handler);
          context.resource_handler = handler;
          return;
        }
      }
    }
    throw new errors_js_1.HTTPError(enums_js_1.StatusCode.NotFound);
  }
  // @ts-ignore: Need Node interface
  handle(incomingRequest, response) {
    const context = this.createContext(incomingRequest, response);
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
      .then(() => {
        // @ts-ignore
        context.response.end("Hello");
      });
    // .then(() => (context.response as ResponseBuilder).build());
  }
  /**
   * Each incoming request has its own context so as not to overlap with one
   * another. The context is created here.
   * @param incomingRequest - The request to create a context for before it is
   * processed through the chain.
   * @returns The context Drash needs to process the request end-to-end.
   */
  // @ts-ignore: Need Node interface
  createContext(incomingRequest, response) {
    const context = {
      // @ts-ignore: Need Node interface
      request: new request_js_1.Request(incomingRequest),
      // @ts-ignore: Need Node interface
      response,
    };
    return context;
  }
  addResourceHandler(ResourceClass) {
    this.resource_handlers[ResourceClass.name] = new resource_handler_js_1
      .ResourceHandler(ResourceClass);
  }
}
exports.RequestHandler = RequestHandler;
//# sourceMappingURL=request_handler.js.map
