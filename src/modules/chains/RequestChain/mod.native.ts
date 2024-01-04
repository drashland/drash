/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
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
import { Resource as CoreResource } from "../../../core/http/Resource.ts";

// Imports > Standard
import { WithParams } from "../../../standard/handlers/RequestParamsParser.ts";
import { ResourceGroup } from "../../../standard/http/ResourceGroup";

// Imports > Modules
import { RequestChain } from "../../base/RequestChain.ts";

type HTTPRequest = WithParams;

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////
//
// This public API may re-export (or relay) values exported from other modules.
// For more information on re-export/relay, see the following:
//
// https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export#re-exporting_aggregating
//

// Exports > Core
export { HTTPError } from "../../../core/errors/HTTPError.ts";

// Exports > Standard
export { Middleware } from "../../../standard/http/Middleware.ts";

// Exports > Local
export type { HTTPRequest };

/**
 * This class' purpose is to make importing this module not look and feel weird.
 * For example, we want the `import` and `require` statements to look like:
 *
 * ```js
 * const { Chain, Resource } = require("...");
 * import { Chain, Resource } from "...";
 * ```
 *
 * We do not want this (this is fugly):
 *
 * ```js
 * const { builder, Resource } = require("...");
 * import { builder, Resource } from "...";
 * ```
 */
export class Chain {
  static builder() {
    return builder();
  }
}

export class Resource extends CoreResource {
  static group() {
    return ResourceGroup.builder();
  }
}

/**
 * Get the builder that builds an HTTP request chain.
 */
export function builder() {
  return RequestChain
    .builder()
    // @ts-ignore URLPattern is available when using the Deno extension, but we
    // should not force using the Deno extension just to accomodate the build
    // process. Therefore, it is ignored.
    .urlPatternClass(URLPattern);
}
