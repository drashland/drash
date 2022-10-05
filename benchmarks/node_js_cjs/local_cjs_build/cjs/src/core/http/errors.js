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
exports.HttpError = void 0;
const enums_js_1 = require("../enums.js");
const status_code_registry_js_1 = require("../http/status_code_registry.js");
/**
 * Use this class to throw uniform errors in the request-resource-response
 * lifecycle.
 *
 * @example
 *
 * ```ts
 * // Usage in resource
 *
 * public GET(request: Drash.Request, response: Drash.Response) {
 *   if (!request.header("authorization")) {
 *     throw new HttpError(401, "Get out!");
 *   }
 * }
 *
 * // Usage in service
 *
 * public runBeforeResource(request: Drash.Request, response: Drash.Response) {
 *   if (!request.header("authorization")) {
 *     throw new HttpError(401, "Get out!");
 *   }
 * }
 * ```
 */
class HttpError extends Error {
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  /**
   * Construct an object of this class.
   *
   * @param StatusCode - A valid HTTP status code.
   * @param message - (optional) The error message.
   */
  constructor(proposedStatusCode, message) {
    super(message);
    const registry =
      status_code_registry_js_1.StatusCodeRegistry.get(proposedStatusCode) ||
      status_code_registry_js_1.StatusCodeRegistry.get(
        enums_js_1.StatusCode.InternalServerError,
      );
    this.code = registry.value;
    if (!message) {
      this.message = registry.description;
    }
  }
}
exports.HttpError = HttpError;
//# sourceMappingURL=errors.js.map
