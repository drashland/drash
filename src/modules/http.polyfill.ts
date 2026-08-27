/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
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

/**
 * The HTTP module for runtimes without a dependable global `URLPattern` — Node
 * and Bun. Identical to `http.native` apart from that.
 *
 * @module
 */

// Imports > Core
import { Resource as CoreResource } from "../core/http/Resource.ts";

// Imports > Standard
import { URLPatternPolyfill } from "../standard/polyfill/URLPatternPolyfill.ts";
import type { WithParams } from "../standard/handlers/RequestParamsParser.ts";

// Imports > Modules
import { type Builder, requestChain } from "./builders/RequestChainBuilder.ts";

/**
 * A Web `Request` with Drash's `params` attached.
 *
 * This is what a resource method receives on runtimes that hand Drash a
 * `Request`. Import it with `import type` — it is a type, not a class.
 */
type HTTPRequest = WithParams;

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////
//
// This public API may re-export (or relay) values exported from other modules.
// For more information on re-export/relay, see the following:
//
// https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export#re-exporting_aggregating
//

// Exports > Core
export { HTTPError } from "../core/errors/HTTPError.ts";

// Exports > Standard
export { Middleware } from "../standard/http/Middleware.ts";
export { ResourceGroup } from "../standard/http/ResourceGroup.ts";

// Exports > Local
export type { HTTPRequest };

/**
 * The HTTP application you build and hand requests to.
 *
 * `Application.builder()` assembles an HTTP request chain — a
 * {@link https://en.wikipedia.org/wiki/Chain-of-responsibility_pattern Chain of
 * Responsibility} of handlers ending at your resource. That is the mechanism;
 * "application" is what you are building with it, and the name this module
 * exposes so the concept a consumer works with matches the thing they are
 * making.
 *
 * The class exists to hold `builder()` so imports read as:
 *
 * ```js
 * const { Application, Resource } = require("...");
 * import { Application, Resource } from "...";
 * ```
 *
 * rather than a bare `builder()`.
 */
export class Application {
  /**
   * Get a builder for assembling an application.
   *
   * The builder comes pre-configured with the standard HTTP request chain and
   * the polyfill `URLPattern`.
   *
   * @returns A builder to add resources and middleware to.
   */
  static builder(): Builder {
    return requestChain()
      .urlPatternClass(URLPatternPolyfill);
  }
}

/**
 * Intentionally empty.
 *
 * This module exports its own `Resource` so it can diverge from the
 * core class later — handling a different input type, or changing the
 * request-resource-response lifecycle — without touching Core. Extend this one,
 * not the core class.
 */
export class Resource extends CoreResource {}
