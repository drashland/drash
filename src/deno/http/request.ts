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

import { AbstractRequest } from "../../core/http/abstract_native_request.ts";

/**
 * Drash's version of a `Request`. This class introduces helper methods to
 * interact with the native `Request` object (e.g., `request.readBody("json"))`.
 */
export class Request extends AbstractRequest {
  /**
   * Set the path params on this request. This takes the request's URL and
   * matches it to the path params defined by the resource it targets.
   * @returns A key-value object where the key is the path param name and the
   * value is the path param value.
   */
  setPathParams(): Record<string, string | undefined> {
    const pathParams: Record<string, string | undefined> = {};

    if (!this.resource_handler) {
      return pathParams;
    }

    const urlPatterns = this.resource_handler
      .getOriginalUrlPatterns() as URLPattern[];

    if (urlPatterns.length <= 0) {
      return pathParams;
    }

    // for (const pattern of this.#resource_handler.url_patterns) {
    for (const pattern of urlPatterns) {
      const result = pattern.exec(this.url);

      if (result === null) {
        continue;
      }

      // This is the resource we need, and below are the path params that were
      // found in the request's URL
      const params: Record<string, string> = {};

      for (const key in result.pathname.groups) {
        params[key] = result.pathname.groups[key];
      }

      for (let [pathParam, value] of Object.entries(params)) {
        if (value) {
          value = value.trim();
        }

        pathParams[pathParam] = value === "" ? undefined : value;
      }
    }

    return pathParams;
  }
}
