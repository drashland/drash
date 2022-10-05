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
import { AbstractResourceHandler } from "../../core/handlers/abstract/resource_handler.js";
import * as Types from "../types.js";
/**
 * Class that handles requests that have made it to an existing resource. This
 * class ensures requests run through the chains defined by the `Resource`.
 * Resource's can have multiple chains -- one for each HTTP method they define;
 * and each of those chains can have services.
 */
export declare class ResourceHandler extends AbstractResourceHandler<
  unknown,
  unknown,
  unknown,
  any,
  Types.ResourcePaths
> {
  /**
   * Take `this.#original.paths` and convert them to `URLPattern` objects.
   * @returns An array of `URLPattern` objects created from
   * `this.#original.paths`.
   */
  getOriginalUrlPatterns(): Types.ResourcePaths[];
  protected getResourcePathsUsingOptionalParams(
    path: string,
  ): Types.ResourcePaths;
  /**
   * Get resource paths for the wildcard path in question. These paths are use
   * to match request URIs to a resource.
   *
   * @param path - The path to parse into parsable pieces.
   *
   * @return A resource paths object.
   */
  protected getResourcePathsUsingWildcard(path: string): Types.ResourcePaths;
  /**
   * Get resource paths for the path in question. These paths are use to match
   * request URIs to a resource.
   *
   * @param path - The path to parse into parsable pieces.
   *
   * @return A resource paths object.
   */
  protected getResourcePaths(path: string): Types.ResourcePaths;
}
