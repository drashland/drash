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

import { AbstractRequest } from "../../core/http/abstract_request.ts";
import * as NodeTypes from "../types.ts";

/**
 * Drash's version of a `Request`. This class introduces helper methods to
 * interact with the native `Request` object (e.g., `request.readBody("json"))`.
 */
export class DrashRequest extends AbstractRequest {
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

    const patterns = this.resource_handler
      .getOriginalUrlPatterns() as NodeTypes.ResourcePaths[];

    if (patterns.length <= 0) {
      return pathParams;
    }

    const url = new URL(this.url);

    for (const pattern of patterns) {
      const matchArray = url.pathname.match(pattern.regex_path);

      // No need to get params if there aren't any
      if (!matchArray || (matchArray.length == 1)) {
        return pathParams;
      }

      const params = matchArray.slice();
      params.shift();

      pattern.params.forEach((paramName: string, index: number) => {
        pathParams[paramName] = params[index];
      });
    }

    return pathParams;
  }
}
