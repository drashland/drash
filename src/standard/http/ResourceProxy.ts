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
 * Stands in for a resource and forwards every HTTP method to it. The base for
 * the proxies a resource group generates.
 *
 * @module
 */

// Imports > Core
import { Resource } from "../../core/http/Resource.ts";

/**
 * Stands in for a resource, forwarding every HTTP method to it.
 *
 * `ResourceGroup` generates a subclass of this per resource so middleware and
 * path prefixes can be applied without modifying the resource itself.
 */
class ResourceProxy extends Resource {
  /**
   * The paths of the resource being proxied. Copied by {@link setOriginal}.
   */
  public override paths: string[] = [];
  /**
   * The resource being proxied. Undefined until {@link setOriginal} is called,
   * which is why every method below forwards optionally.
   */
  protected original_instance?: Resource;

  /**
   * Set the resource to proxy, adopting its paths.
   *
   * @param originalInstance The resource this proxy stands in for.
   * @returns The same resource, so a caller can keep a reference to it.
   */
  public setOriginal(originalInstance: Resource): Resource {
    this.paths = originalInstance.paths;
    this.original_instance = originalInstance;
    return this.original_instance;
  }

  /**
   * Forward a `CONNECT` request to the proxied resource.
   *
   * @param request The request, in whatever shape the runtime provides.
   * @returns Whatever the proxied resource returns, or `undefined` if no
   * resource has been set.
   */
  public override CONNECT(request: unknown): unknown {
    return this.original_instance?.CONNECT(request);
  }

  /**
   * Forward a `DELETE` request to the proxied resource.
   *
   * @param request The request, in whatever shape the runtime provides.
   * @returns Whatever the proxied resource returns, or `undefined` if no
   * resource has been set.
   */
  public override DELETE(request: unknown): unknown {
    return this.original_instance?.DELETE(request);
  }

  /**
   * Forward a `GET` request to the proxied resource.
   *
   * @param request The request, in whatever shape the runtime provides.
   * @returns Whatever the proxied resource returns, or `undefined` if no
   * resource has been set.
   */
  public override GET(request: unknown): unknown {
    return this.original_instance?.GET(request);
  }

  /**
   * Forward a `HEAD` request to the proxied resource.
   *
   * @param request The request, in whatever shape the runtime provides.
   * @returns Whatever the proxied resource returns, or `undefined` if no
   * resource has been set.
   */
  public override HEAD(request: unknown): unknown {
    return this.original_instance?.HEAD(request);
  }

  /**
   * Forward a `OPTIONS` request to the proxied resource.
   *
   * @param request The request, in whatever shape the runtime provides.
   * @returns Whatever the proxied resource returns, or `undefined` if no
   * resource has been set.
   */
  public override OPTIONS(request: unknown): unknown {
    return this.original_instance?.OPTIONS(request);
  }

  /**
   * Forward a `PATCH` request to the proxied resource.
   *
   * @param request The request, in whatever shape the runtime provides.
   * @returns Whatever the proxied resource returns, or `undefined` if no
   * resource has been set.
   */
  public override PATCH(request: unknown): unknown {
    return this.original_instance?.PATCH(request);
  }

  /**
   * Forward a `POST` request to the proxied resource.
   *
   * @param request The request, in whatever shape the runtime provides.
   * @returns Whatever the proxied resource returns, or `undefined` if no
   * resource has been set.
   */
  public override POST(request: unknown): unknown {
    return this.original_instance?.POST(request);
  }

  /**
   * Forward a `PUT` request to the proxied resource.
   *
   * @param request The request, in whatever shape the runtime provides.
   * @returns Whatever the proxied resource returns, or `undefined` if no
   * resource has been set.
   */
  public override PUT(request: unknown): unknown {
    return this.original_instance?.PUT(request);
  }

  /**
   * Forward a `TRACE` request to the proxied resource.
   *
   * @param request The request, in whatever shape the runtime provides.
   * @returns Whatever the proxied resource returns, or `undefined` if no
   * resource has been set.
   */
  public override TRACE(request: unknown): unknown {
    return this.original_instance?.TRACE(request);
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { ResourceProxy };
