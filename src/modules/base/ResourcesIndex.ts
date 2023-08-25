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
import { IResource } from "../../core/Interfaces.ts";
import { ConstructorWithArgs } from "../../core/Types.ts";

// Imports > Standard
import { ConsoleLogger, Level } from "../../standard/log/ConsoleLogger.ts";
import { HTTPError } from "../../standard/errors/HTTPError.ts";
import { Logger } from "../../standard/log/Logger.ts";
import { SearchIndex } from "../../standard/handlers/SearchIndex.ts";
import { StatusCode } from "../../standard/http/response/StatusCode.ts";

// Imports > Modules
import { ResourceClassesArray } from "./types/ResourceClassesArray.ts";

type Index = {
  resource: IResource;
  path_patterns: PathPattern[];
};

type Input = { url: string };

type PathPatternExecResult = {
  pathname?: {
    groups: Record<string, string | undefined>;
  };
};

interface PathPattern {
  pathname: string;
  exec(input: string): PathPatternExecResult | null;
}

type PathPatternClass = ConstructorWithArgs<PathPattern>;

type SearchResult = {
  resource: IResource;
  path_params: Record<string, string | undefined>;
};

abstract class ResourcesIndex extends SearchIndex<
  Promise<SearchResult | null>
> {
  #cached_search_results: Record<string, SearchResult | null> = {};
  #logger: Logger = ConsoleLogger.create("ResourcesIndex", Level.Off);
  protected index: Index[] = [];
  protected resources: ResourceClassesArray = [];
  protected PathPatternClass: PathPatternClass;

  constructor(
    PathPatternClass: PathPatternClass,
    resources: ResourceClassesArray,
  ) {
    super();
    this.resources = resources ?? [];
    this.PathPatternClass = PathPatternClass;
    this.buildIndex();
  }

  public handle(request: Input): Promise<SearchResult | null> {
    return Promise
      .resolve()
      .then(() => this.#logger.debug(`Input received`))
      .then(() => this.#validateRequest(request))
      .then(() => this.search(request))
      .then((result) => super.nextHandler({ request, result }));
  }

  protected buildIndex(...resources: ResourceClassesArray): void {
    this.#logger.debug(`Building resources index`);

    for (const ResourceClass of this.resources) {
      if (Array.isArray(ResourceClass)) {
        this.buildIndex(ResourceClass);
        continue;
      }

      const pathPatterns: PathPattern[] = [];

      const resource = new ResourceClass();
      resource.paths.forEach((path: string) => {
        // Add "{/}?" to match possible trailing slashes too. For example, this
        // means the following paths point to the same resource:
        //
        //   - /coffee
        //   - /coffee/
        //
        pathPatterns.push(
          new this.PathPatternClass({ pathname: path + "{/}?" }),
        );

        this.#logger.debug(`Added resource/pathname mapping: {}`, {
          name: resource.constructor.name,
          path,
        });
      });

      this.index.push({
        resource,
        path_patterns: pathPatterns,
      });
    }
  }

  protected search(request: { url: string }): Promise<SearchResult | null> {
    const fullyQualifiedUrl = request.url;

    this.#logger.debug(`Searching for resource - url: {}`, fullyQualifiedUrl);

    let urlPathname = fullyQualifiedUrl;

    try {
      urlPathname = fullyQualifiedUrl.replace(/http(s)?:\/\/.+\//, "/");
    } catch (_error) {}

    this.#logger.debug(
      `Finding first resource by URL pathname - pathname: {}`,
      urlPathname,
    );

    const cachedSearchResult = this.#getCachedSearchResult(fullyQualifiedUrl);
    if (cachedSearchResult) {
      return Promise.resolve(cachedSearchResult);
    }

    for (const resourcePathPatterns of this.index.values()) {
      for (const pattern of resourcePathPatterns.path_patterns) {
        try {
          this.#logger.trace(
            "Checking path - resource: {}; pattern: {}; pathnames: {}",
            resourcePathPatterns.resource?.constructor?.name || "Resource",
            pattern.pathname,
            urlPathname,
          );
        } catch (error) {
          this.#logger.debug(`Error checking path - error: {}`, error.message);
        }

        const result = pattern.exec(fullyQualifiedUrl);

        // No resource? Check the next one.
        if (result === null) {
          continue;
        }

        const resource = resourcePathPatterns.resource;

        this.#logger.debug(
          `Found resource - resource: {}`,
          resource?.constructor?.name,
        );

        this.#logger.debug(
          `Caching resource - resource: {}`,
          resource?.constructor?.name,
        );

        this.#cached_search_results[fullyQualifiedUrl] = {
          path_params: result.pathname?.groups || {},
          resource,
        };

        return Promise.resolve(this.#cached_search_results[fullyQualifiedUrl]);
      }
    }

    this.#cached_search_results[fullyQualifiedUrl] = null;
    return Promise.resolve(this.#cached_search_results[fullyQualifiedUrl]);
  }

  #getCachedSearchResult(fullyQualifiedUrl: string): SearchResult | null {
    if (this.#cached_search_results[fullyQualifiedUrl]) {
      const cachedResult = this.#cached_search_results[fullyQualifiedUrl];

      if (cachedResult) {
        this.#logger.debug(
          `Found cached resource - resource: {}`,
          cachedResult.resource?.constructor?.name,
        );

        return cachedResult;
      }
    }

    return null;
  }

  #validateRequest(request: unknown): void {
    if (!request || typeof request !== "object") {
      throw new HTTPError(
        StatusCode.InternalServerError,
        "Request could not be read",
      );
    }

    if (!("url" in request) || typeof request.url !== "string") {
      throw new HTTPError(
        StatusCode.InternalServerError,
        "Request URL could not be read",
      );
    }
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Input, ResourcesIndex, type SearchResult };
