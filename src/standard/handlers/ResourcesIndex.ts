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
 * Matches a request URL against every resource's paths using `URLPattern`, and
 * caches the result per URL.
 *
 * @module
 */

// Imports > Core
import { HTTPError } from "../../core/errors/HTTPError.ts";
import type { Resource } from "../../core/http/Resource.ts";
import { Status } from "../../core/http/response/Status.ts";

// Imports > Standard
import { AbstractSearchIndex } from "../handlers/AbstractSearchIndex.ts";

/**
 * The input this handler requires: an object carrying the request URL.
 */
type Input = { url: string };

/**
 * The subset of `URLPattern` this index uses. Narrow on purpose, so the
 * polyfill only has to implement what is actually needed.
 */
export interface IURLPattern {
  /**
   * The path this pattern was compiled from.
   */
  pathname: string;
  /**
   * Match a URL against this pattern.
   *
   * @param input The URL to match.
   * @returns The matched path params, or `null` if it does not match.
   */
  exec(input: string): URLPatternExecResult | null;
}

/**
 * A resource class, or an array of them. Resource groups build arrays, so both
 * shapes reach the index and it flattens them while building.
 */
export type ResourceClasses = typeof Resource | typeof Resource[];

/**
 * A matched resource and the path params extracted from the URL.
 */
type SearchResult = {
  resource: Resource;
  path_params: Record<string, string | undefined>;
};

/**
 * The part of a `URLPattern.exec()` result this index reads.
 */
export type URLPatternExecResult = {
  pathname?: {
    groups: Record<string, string | undefined>;
  };
};

/**
 * The constructor shape of a `URLPattern` implementation. Passing this in is
 * what lets the native and polyfill HTTP modules share one index.
 */
interface URLPatternClass {
  /**
   * Compile a path into a matchable pattern.
   *
   * @param options The pattern source. Only `pathname` is used; Drash matches
   * on the path alone.
   */
  new (options: { pathname: string }): IURLPattern;
}

/**
 * Matches a request URL against the paths of every registered resource.
 *
 * Patterns are compiled once when the index is built, not per request, and
 * results are cached by fully qualified URL.
 */
class ResourcesIndex extends AbstractSearchIndex<SearchResult | null> {
  #cached_search_results: Record<string, SearchResult | null> = {};
  /**
   * The compiled index: each resource paired with a pattern per path it declares.
   */
  protected index: {
    resource: Resource;
    path_patterns: IURLPattern[];
  }[] = [];
  /**
   * The resource classes this index was constructed with, before flattening.
   */
  protected resources: ResourceClasses[] = [];
  /**
   * The `URLPattern` implementation used to compile and match paths.
   */
  protected URLPatternClass: URLPatternClass;

  /**
   * Build the index from the given resources.
   *
   * @param URLPatternClass The `URLPattern` implementation to compile paths
   * with — the runtime's global, or Drash's polyfill.
   * @param resources The resources to index. Arrays are flattened, so a resource
   * group can be passed straight through.
   */
  constructor(
    URLPatternClass: URLPatternClass,
    ...resources: ResourceClasses[]
  ) {
    super();
    this.resources = resources ?? [];
    this.URLPatternClass = URLPatternClass;
    this.buildIndex(this.resources);
  }

  /**
   * Search the index for a resource matching the request URL, and pass the
   * request and the result to the next handler.
   *
   * A miss is not an error here — it is passed on as `null` for
   * `ResourceNotFoundHandler` to turn into a 404.
   *
   * @param request The request, which must carry a readable URL.
   * @returns Whatever the rest of the chain returns.
   */
  public override handle<Output>(request: Input): Promise<Output> {
    return Promise
      .resolve()
      .then(() => this.#validateRequest(request))
      .then(() => this.search(request))
      .then((result) => {
        return super.sendToNextHandler<Output>({
          request,
          result,
        });
      });
  }

  /**
   * Compile every resource's paths into patterns.
   *
   * `{/}?` is appended to each path so a trailing slash matches too, which is
   * why `/coffee` and `/coffee/` reach the same resource.
   *
   * @param resources The resources to index. Arrays are flattened recursively.
   */
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

  /**
   * Find the first resource whose paths match the given URL.
   *
   * @param request The request carrying the URL to match.
   * @returns The matched resource and its path params, or `null` if nothing
   * matched.
   */
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
        Status.InternalServerError,
        "Request could not be read",
      );
    }

    if (!("url" in request) || typeof request.url !== "string") {
      throw new HTTPError(
        Status.InternalServerError,
        "Request URL could not be read",
      );
    }
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Input, ResourcesIndex, type SearchResult, type URLPatternClass };
