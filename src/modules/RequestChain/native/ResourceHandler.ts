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
import { HTTPError } from "../../../core/errors/HTTPError.ts";
import { Status } from "../../../core/http/Status.ts";
import { ILogger } from "../../../core/interfaces/ILogger.ts";

// Imports > Standard
import {
  AbstractResourceHandler,
  type CtorParams,
  type InputRequest,
  type ResourceClassesArray,
  type ResourceWithPathParams,
} from "../../../standard/handlers/AbstractResourceHandler.ts";
import { GroupConsoleLogger } from "../../../standard/log/GroupConsoleLogger.ts";

class Builder extends AbstractResourceHandler.AbstractBuilder {
  public build<I extends InputRequest, O>(): ResourceHandler<I, O> {
    return new ResourceHandler<I, O>(this.constructor_args);
  }
}

class ResourceHandler<
  I extends InputRequest,
  O,
> extends AbstractResourceHandler<I, O> {
  /**
   * @see {@link Builder} for implementation.
   */
  static Builder = Builder;

  #logger: ILogger = GroupConsoleLogger.create("ResourceHandler");

  constructor(options: CtorParams) {
    super(options);
    this.addResources(options?.resources || []);
  }

  /**
   * Get the builder for building this handler.
   * @returns An instance of the builder.
   */
  static builder(): Builder {
    return new Builder();
  }

  protected addResources(resources: ResourceClassesArray): void {
    for (const ResourceClass of resources) {
      if (Array.isArray(ResourceClass)) {
        this.addResources(ResourceClass);
        continue;
      }

      // @ts-ignore
      const pathPatterns: any[] = []; // Should be URLPattern, not any

      const resource = new ResourceClass();
      resource.paths.forEach((path: string) => {
        // Add "{/}?" to match possible trailing slashes too. For example, this
        // means the following paths point to the same resource:
        //
        //   - /coffee
        //   - /coffee/
        //
        // @ts-ignore
        pathPatterns.push(new URLPattern({ pathname: path + "{/}?" }));

        this.#logger.debug(`Added resource/pathname mapping: {}`, {
          name: resource.constructor.name,
          path,
        });
      });

      this.resource_path_patterns.push({
        resource,
        path_patterns: pathPatterns,
      });
    }
  }

  protected findFirstResourceByURL(
    fullyQualifiedUrl: string,
  ): ResourceWithPathParams {
    let urlPathname = fullyQualifiedUrl;

    try {
      urlPathname = fullyQualifiedUrl.replace(/http(s)?:\/\/.+\//, "/");
    } catch (_error) {}

    this.#logger.debug(
      `Finding first resource by URL pathname - pathname: {}`,
      urlPathname,
    );

    if (this.cached_resources[fullyQualifiedUrl]) {
      const resourceWithPathParams = this.cached_resources[fullyQualifiedUrl]!;
      this.#logger.debug(
        `Found cached resource - resource: {}`,
        resourceWithPathParams?.resource?.constructor?.name,
      );
      return resourceWithPathParams;
    }

    const ret: ResourceWithPathParams = {
      resource: null,
      path_params: {},
    };

    for (const resourcePathPatterns of this.resource_path_patterns.values()) {
      for (const pattern of resourcePathPatterns.path_patterns) {
        try {
          this.#logger.trace(
            "Checking path - resource: {}; pattern: {}; pathnames: {}",
            resourcePathPatterns.resource?.constructor?.name || "Resource",
            pattern.pathname,
            urlPathname,
          );
        } catch (_err) {}

        const result = pattern.exec(fullyQualifiedUrl);

        // No resource? Check the next one.
        if (result === null) {
          continue;
        }

        this.#logger.debug(
          `Found resource - resource: {}`,
          ret.resource?.constructor?.name,
        );

        // this is the resource we need, and below are the params
        const params: Record<string, string> = {};
        for (const key in result.pathname.groups) {
          params[key] = result.pathname.groups[key];
        }

        ret.resource = resourcePathPatterns.resource;
        ret.path_params = params;

        this.#logger.debug(
          `Caching resource - resource: {}`,
          ret.resource?.constructor?.name,
        );

        this.cached_resources[fullyQualifiedUrl] = ret;
        return ret;
      }
    }

    // TODO(crookse) What does the stack trace look like with this error thrown?
    this.#logger.debug(`Resource not found (throwing 404)`);
    throw new HTTPError(Status.NotFound.Code);
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Builder, ResourceHandler };
