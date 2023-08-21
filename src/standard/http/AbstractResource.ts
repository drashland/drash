/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
 * Copyright (C) 2023  Drash authors. The Drash authors are listed in the
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

// Imports > Core
import { AbstractResource as Base } from "../../core/http/AbstractResource.ts";
import type { ResourceClass } from "../../core/types/ResourceClass.ts";

// Imports > Standard
import { type Builder, ResourceGroup } from "./ResourceGroup.ts";

type ResourceClasses = (ResourceClass | ResourceClass[])[];

/**
 * A base class with a resource group builder.
 */
export abstract class AbstractResource extends Base {
  /**
   * Instantiate a {@link Builder} with the given `resources`.
   * @param resources The resource classes to group together.
   * @returns A {@link Builder}.
   */
  static group(
    ...resources: ResourceClasses
  ): Omit<Builder, "resources"> {
    return ResourceGroup.builder().resources(...resources);
  }
}
