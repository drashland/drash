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
import { Resource } from "../../core/http/Resource.ts";
import type { IBuilder } from "../../core/interfaces/IBuilder.ts";

// Imports > Standard
import { Middleware } from "./Middleware.ts";

type ResourceClasses = (typeof Resource | typeof Resource[])[];

/**
 * Builder for building a resource group. Resources in a resource group can
 * share the following:
 *
 * - Middleware
 * - Path prefixes
 */
class Builder implements IBuilder {
  #path_prefixes: string[] = [];
  #middleware: Middleware[] = [];
  #resources: typeof Resource[] = [];

  /**
   * Set the resources for this group so they can share functionality.
   * @param resources The resources to group together.
   * @returns This instance so you can chain more methods.
   * ---
   * @example
   * ```ts
   * class Coffees extends Resource {
   *   public paths = ["/coffees"];
   * }
   *
   * class Teas extends Resource {
   *   public paths = ["/teas"];
   * }
   *
   * const group = ResourceGroup
   *   .builder()
   *   .resources(        // The resources here will share ...
   *      Coffees,
   *      Teas
   *    )
   *   .pathPrefixes( // ... the path prefixes here ...
   *      "/api/v1",
   *      "/v1"
   *    )
   *   .middleware(   // ... and use the middleware here.
   *      MiddlewareA,
   *      MiddlewareB,
   *    )
   *   .build();
   * ```
   */
  resources(...resources: ResourceClasses): this {
    const ret = [];

    for (const input of resources) {
      if (Array.isArray(input)) {
        ret.push(...input);
        continue;
      }

      ret.push(input);
    }

    this.#resources = ret;

    return this;
  }

  /**
   * Set the path prefixes for all resources in this group.
   * @param pathPrefixes The path prefixes the resources will use.
   * @returns This instance so you can chain more methods.
   *
   * @example
   * ```ts
   * class Coffees extends Resource {
   *   public paths = ["/coffees"];
   * }
   *
   * const group = ResourceGroup
   *   .builder()
   *   .pathPrefixes("/api/v1")
   *   .resources(Coffees) // Coffees.paths becomes ["/api/v1/coffees"]
   *   .build();
   * ```
   */
  pathPrefixes(...pathPrefixes: string[]): this {
    this.#path_prefixes = pathPrefixes;
    return this;
  }

  /**
   * Set the middlware for all resources in this group.
   * @param middleware The middleware the resources will use.
   * @returns This instance so you can chain more methods.
   *
   * @example
   * ```ts
   * class Coffees extends Resource { ... }
   * class Teas extends Resource { ... }
   * class MiddlewareA extends Middleware { ... }
   * class MiddlewareB extends Middleware { ... }
   *
   * const group = ResourceGroup
   *   .builder()
   *   .middleware( // This middleware ...
   *      MiddlewareA,
   *      MiddlewareB
   *   )
   *   .resources(      // ... will be used by these resources
   *      Coffees,
   *      Teas
   *   )
   *   .build();
   * ```
   */
  middleware(
    ...middleware: Middleware[]
  ): this {
    this.#middleware = middleware;
    return this;
  }

  /**
   * Build the resource group.
   * @returns An array of all the resources passed to the `this.resources()`
   * call with shared functionality (path prefixes, middleware, etc.).
   */
  build(): typeof Resource[] {
    let ret = [];

    ret = createGroupWithMiddleware(
      this.#middleware,
      this.#resources,
    );

    ret = createGroupWithPrefixes(
      this.#path_prefixes,
      ret,
    );

    return ret;
  }
}

function createGroupWithPrefixes(
  prefixes: string[],
  resourceClasses: typeof Resource[],
): typeof Resource[] {
  if (!prefixes || !prefixes.length) {
    return resourceClasses;
  }

  return resourceClasses.map((ResourceClass: typeof Resource) => {
    // Here we are creating the proxy that will be used by the client. The
    // only purpose of this proxy is to be instantiable so it can be
    // instantiated by the client and have the paths set using the prefixes.
    return class PrefixedResourceProxy extends ResourceClass {
      constructor() {
        super();
        this.paths = this.#getPathsWithPrefixes();
      }

      #getPathsWithPrefixes(): string[] {
        if (!prefixes || prefixes.length <= 0) {
          return this.paths;
        }

        const paths: string[] = [];

        for (const prefix of prefixes) {
          for (const path of this.paths) {
            paths.push(prefix + path);
          }
        }

        return paths;
      }
    };
  });
}

function createGroupWithMiddleware(
  middlewareClasses: Middleware[],
  resourceClasses: typeof Resource[],
): typeof Resource[] {
  if (arrayEmpty(middlewareClasses)) {
    return resourceClasses;
  }

  if (arrayEmpty(resourceClasses)) {
    return resourceClasses;
  }

  const wrapped = resourceClasses.map((ResourceClass) => {
    const middlewareCopies = middlewareClasses.slice();
    let first: Middleware;

    const resourceInstance = new ResourceClass();

    if (middlewareClasses.length <= 1) {
      first = middlewareCopies[0];
      first.setOriginal(resourceInstance);
    } else {
      // If more than one middleware instance exists, then we link them together
      // from top top bottom. For example, if the below was given ...
      //
      // [
      //   MiddlewareA,
      //   MiddlewareB,
      //   MiddlewareC,
      //   MiddlewareZ,
      // ]
      //
      // ..., then they would be linked together like ...
      //
      // MiddlewareEntryPoint {
      //   original: MiddlewareA {
      //     original: MiddlewareB {
      //       original: MiddlewareC {
      //         original: MiddlewareZ { original: TheOriginalResource }
      //       }
      //     }
      //   }
      // }
      //

      const firstMiddlewareInstance = middlewareCopies.shift();

      if (firstMiddlewareInstance) {
        first = firstMiddlewareInstance;

        middlewareCopies.reduce(
          (previousMiddlewareInstance, currentMiddlewareInstance, index) => {
            // Last middleware instance wraps the resource
            if (index + 1 === middlewareCopies.length) {
              currentMiddlewareInstance.setOriginal(resourceInstance);
            }

            previousMiddlewareInstance.setOriginal(currentMiddlewareInstance);

            return currentMiddlewareInstance;
          },
          first,
        );
      }
    }

    // Here we are creating the proxy that will be used by the client. The
    // only purpose of this proxy is to be instantiable just like a resource and
    // is an extension of the resource it is proxying.

    // We extend the original resource class so the paths are kept intact
    const p = class MiddlewareEntryPoint extends ResourceClass {
      public CONNECT(input: unknown): unknown {
        return first.CONNECT(input);
      }

      public DELETE(input: unknown): unknown {
        return first.DELETE(input);
      }

      public GET(input: unknown): unknown {
        return first.GET(input);
      }

      public HEAD(input: unknown): unknown {
        return first.HEAD(input);
      }

      public OPTIONS(input: unknown): unknown {
        return first.OPTIONS(input);
      }

      public PATCH(input: unknown): unknown {
        return first.PATCH(input);
      }

      public POST(input: unknown): unknown {
        return first.POST(input);
      }

      public PUT(input: unknown): unknown {
        return first.PUT(input);
      }

      public TRACE(input: unknown): unknown {
        return first.TRACE(input);
      }
    };

    Object.defineProperty(p, "name", {
      value: resourceInstance.constructor.name + "MiddlewareProxy",
    });

    return p;
  });

  return wrapped;
}

class ResourceGroup {
  static Builder = Builder;

  static builder(): Builder {
    return new Builder();
  }
}

function arrayEmpty(value: unknown[]): boolean {
  if (!value) {
    return true;
  }

  if (!Array.isArray(value)) {
    return true;
  }

  if (value.length === 0) {
    return true;
  }

  return false;
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Builder, ResourceGroup };
