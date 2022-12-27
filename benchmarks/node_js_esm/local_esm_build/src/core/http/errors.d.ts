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
import { StatusCode } from "../enums.js";
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
 *     throw new HTTPError(401, "Get out!");
 *   }
 * }
 *
 * // Usage in service
 *
 * public runBeforeResource(request: Drash.Request, response: Drash.Response) {
 *   if (!request.header("authorization")) {
 *     throw new HTTPError(401, "Get out!");
 *   }
 * }
 * ```
 */
export declare class HTTPError extends Error {
  /**
   * The HTTP status code associated with this error.
   */
  code: StatusCode;
  /**
   * Construct an object of this class.
   *
   * @param StatusCode - A valid HTTP status code.
   * @param message - (optional) The error message.
   */
  constructor(proposedStatusCode: StatusCode, message?: string);
}
