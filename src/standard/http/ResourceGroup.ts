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
import type { IResource } from "../../core/interfaces/IResource.ts";
import { Middleware } from "./Middleware.ts";

type ResourceCtor = typeof Resource;

type ResourceClasses = (ResourceCtor | ResourceCtor[])[];

/**
 * Builder for building a resource group. Resources in a resource group can
 * share the following:
 *
 * - Middleware
 * - Path prefixes
 */
class Builder implements IBuilder {
  #path_prefixes: string[] = [];
  #middleware: typeof Middleware[] = [];
  #resources: ResourceCtor[] = [];
  #group: ResourceCtor[] = [];

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
   *   .withPathPrefixes( // ... the path prefixes here ...
   *      "/api/v1",
   *      "/v1"
   *    )
   *   .withMiddleware(   // ... and use the middleware here.
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
   * ---
   * @example
   * ```ts
   * class Coffees extends Resource {
   *   public paths = ["/coffees"];
   * }
   *
   * const group = ResourceGroup
   *   .builder()
   *   .withPathPrefixes("/api/v1")
   *   .resources(Coffees) // Coffees.paths becomes ["/api/v1/coffees"]
   *   .build();
   * ```
   */
  withPathPrefixes(...pathPrefixes: string[]): this {
    this.#path_prefixes = pathPrefixes;
    return this;
  }

  /**
   * Set the middlware for all resources in this group.
   * @param middleware The middleware the resources will use.
   * @returns This instance so you can chain more methods.
   * ---
   * @example
   * ```ts
   * class Coffees extends Resource { ... }
   * class Teas extends Resource { ... }
   * class MiddlewareA extends Middleware { ... }
   * class MiddlewareB extends Middleware { ... }
   *
   * const group = ResourceGroup
   *   .builder()
   *   .withMiddleware( // This middleware ...
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
  withMiddleware(
    // TODO(crookse) Fix typing. For now, omit `paths` just to make the compiler
    // happy.
    ...middleware: typeof Middleware[]
  ): this {
    this.#middleware = middleware;
    return this;
  }

  /**
   * Build the resource group.
   * @returns An array of all the resources passed to the `this.resources()`
   * call with shared functionality (path prefixes, middleware, etc.).
   */
  build(): ResourceCtor[] {
    this.#group = createGroupWithMiddleware(
      this.#middleware,
      this.#getTarget(),
    );

    this.#group = createGroupWithPrefixes(
      this.#path_prefixes,
      this.#getTarget(),
    );

    return this.#group;
  }

  /**
   * Get the target which is either the resources or the group. If the group has
   * not been made yet, then we start with the resources as the target to start
   * building the group. If the  group has beem made, then we continue to build
   * off the group.
   * @returns The resources or the group.
   */
  #getTarget(): ResourceCtor[] {
    return this.#group.length === 0 ? this.#resources : this.#group;
  }
}

function createGroupWithPrefixes(
  prefixes: string[],
  resourceClasses: ResourceCtor[],
) {
  if (!prefixes || !prefixes.length) {
    return resourceClasses;
  }

  return resourceClasses.map(
    (ResourceClass: ResourceCtor) => {
      return createResourceWithPrefixes(prefixes, ResourceClass);
    },
  );
}

function createGroupWithMiddleware(
  middlewareClasses: typeof Middleware[],
  resourceClasses: ResourceCtor[],
): ResourceCtor[] {
  if (arrayEmpty(middlewareClasses)) {
    return resourceClasses;
  }

  if (arrayEmpty(resourceClasses)) {
    return resourceClasses;
  }

  // If there's only one service, then we just need to wrap the service around
  // each resource class
  if (middlewareClasses.length === 1) {
    return resourceClasses.map((ResourceClass) => {
      const resource = new ResourceClass();
      const ServiceClass = middlewareClasses[0];
      const service = new ServiceClass(resource);
      return resourceProxy(service, ResourceClass);
    });
  }

  // TODO(crookse) ngl... i won't be able to read this later even though i wrote
  // it. just trying to get the code working to make it testable for later
  // cleaning and refactoring.
  const wrapped = resourceClasses.map((resourceClass) => {
    const firstService = middlewareClasses.reduceRight((
      previous:
        | IResource
        | typeof Middleware,
      current:
        | IResource
        | typeof Middleware,
      index: number,
    ) => {
      if (typeof current !== "function") {
        return previous;
      }

      if ((index + 1) === middlewareClasses.length) {
        const resourceInstance = new resourceClass();
        const lastService = new current(resourceInstance);
        return lastService;
      }

      return new current(previous as IResource);
    }, middlewareClasses[middlewareClasses.length - 1]);

    return resourceProxy(
      firstService as Middleware,
      resourceClass,
    );
  });

  return wrapped;
}

function resourceProxy(
  service: Middleware,
  ResourceClass: typeof Resource,
): typeof Resource {
  const p = class ResourceWithService extends ResourceClass {
    CONNECT(request: unknown): unknown {
      return service.ALL(request);
    }

    DELETE(request: unknown): unknown {
      return service.ALL(request);
    }

    GET(request: unknown): unknown {
      return service.ALL(request);
    }

    HEAD(request: unknown): unknown {
      return service.ALL(request);
    }

    OPTIONS(request: unknown): unknown {
      return service.ALL(request);
    }

    PATCH(request: unknown): unknown {
      return service.ALL(request);
    }

    POST(request: unknown): unknown {
      return service.ALL(request);
    }

    PUT(request: unknown): unknown {
      return service.ALL(request);
    }

    TRACE(request: unknown): unknown {
      return service.ALL(request);
    }
  };

  return createProxy(p, ResourceClass);
}

function createResourceWithPrefixes(
  prefixes: string[],
  ResourceClass: typeof Resource,
): typeof Resource {
  const p = class ResourceWithPrefix extends ResourceClass {
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

  return createProxy(p, ResourceClass);
}

function createProxy(
  proxy: typeof Resource,
  ResourceClass: typeof Resource,
): typeof Resource {
  // Keep the original name for debugging purposes
  Object.defineProperty(proxy, "name", { value: ResourceClass.name });

  // Add some other stuff that I cannot think of right now

  return proxy;
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
