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
import { HTTPError } from "../../core/errors/HTTPError.ts";
import { Resource } from "../../core/http/Resource.ts";
import { StatusCode } from "../../core/http/response/StatusCode.ts";

// Imports > Standard
import { AbstractSearchIndex } from "../handlers/AbstractSearchIndex.ts";

type Input = { url: string };

interface IURLPattern {
  pathname: string;
  exec(input: string): URLPatternExecResult | null;
}

type ResourceClasses = typeof Resource | typeof Resource[];

type SearchResult = {
  resource: Resource;
  path_params: Record<string, string | undefined>;
};

type URLPatternExecResult = {
  pathname?: {
    groups: Record<string, string | undefined>;
  };
};

interface URLPatternClass {
  new (options: { pathname: string }): IURLPattern;
}

class ResourcesIndex extends AbstractSearchIndex<
  Promise<SearchResult | null>
> {
  #cached_search_results: Record<string, SearchResult | null> = {};
  protected index: {
    resource: Resource;
    path_patterns: IURLPattern[];
  }[] = [];
  protected resources: ResourceClasses[] = [];
  protected URLPatternClass: URLPatternClass;

  constructor(
    URLPatternClass: URLPatternClass,
    ...resources: ResourceClasses[]
  ) {
    super();
    this.resources = resources ?? [];
    this.URLPatternClass = URLPatternClass;
    this.buildIndex(this.resources);
  }

  public handle(request: Input): Promise<SearchResult | null> {
    return Promise
      .resolve()
      .then(() => this.#validateRequest(request))
      .then(() => this.search(request))
      .then((result) => super.nextHandler({ request, result }));
  }

  protected override buildIndex(resources: ResourceClasses[]): void {
    for (const Resource of resources) {
      if (Array.isArray(Resource)) {
        this.buildIndex(Resource);
        continue;
      }

      const urlPatterns: IURLPattern[] = [];

      const resource = new Resource();
      resource.paths.forEach((path: string) => {
        // Add "{/}?" to match possible trailing slashes too. For example, this
        // means the following paths point to the same resource:
        //
        //   - /coffee
        //   - /coffee/
        //
        urlPatterns.push(
          new this.URLPatternClass({ pathname: path + "{/}?" }),
        );
      });

      this.index.push({
        resource,
        path_patterns: urlPatterns,
      });
    }
  }

  protected search(request: { url: string }): Promise<SearchResult | null> {
    const fullyQualifiedUrl = request.url;

    const cachedSearchResult = this.#getCachedSearchResult(fullyQualifiedUrl);
    if (cachedSearchResult) {
      return Promise.resolve(cachedSearchResult);
    }

    for (const resourceURLPatterns of this.index.values()) {
      for (const pattern of resourceURLPatterns.path_patterns) {
        const result = pattern.exec(fullyQualifiedUrl);

        // No resource? Check the next one.
        if (result === null) {
          continue;
        }

        const resource = resourceURLPatterns.resource;

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

export { type Input, ResourcesIndex, type SearchResult, type URLPatternClass };
