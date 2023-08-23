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

// Imports > Standard
import { HTTPError } from "../../../standard/errors/HTTPError.ts";
import {
  AbstractResourceHandler,
  type CtorParams,
  type InputRequest,
  type ResourceClassesArray,
  type ResourceWithPathParams,
} from "../../../standard/handlers/AbstractResourceHandler.ts";
import { StatusCode } from "../../../standard/http/response/StatusCode.ts";
import { GroupConsoleLogger } from "../../../standard/log/GroupConsoleLogger.ts";

const REGEX_URI_MATCHES = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, "g");
const REGEX_URI_REPLACEMENT = "([^/]+)";

type ResourcePaths = {
  og_path: string;
  regex_path: string;
  params: string[];
};

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

  #logger = GroupConsoleLogger.create("ResourceHandler");

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

      const pathPatterns: ResourcePaths[] = [];

      const resource = new ResourceClass();
      for (const path of resource.paths) {
        // Add "{/}?" to match possible trailing slashes too. For example, this
        // means the following paths point to the same resource:
        //
        //   - /coffee
        //   - /coffee/
        //
        pathPatterns.push(this.getResourcePaths(path));
        pathPatterns.push(this.getResourcePathsUsingOptionalParams(path));
        pathPatterns.push(this.getResourcePathsUsingWildcard(path));

        this.#logger.debug(`Added resource/pathname mapping: {}`, {
          name: resource.constructor.name,
          path,
        });
      }

      this.resource_path_patterns.push({
        resource,
        path_patterns: pathPatterns,
      });
    }
  }

  protected findFirstResourceByURL(url: string): ResourceWithPathParams {
    this.#logger.debug(`Finding first resource by URL - url: ${url}`);

    if (this.cached_resources[url]) {
      const resourceWithPathParams = this.cached_resources[url]!;
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

    // Check all the resources to find the one that matches the request's URL
    for (const resourcePathPatterns of this.resource_path_patterns) {
      const { pathname } = new URL(url);

      for (const pathObj of resourcePathPatterns.path_patterns) {
        if (pathObj.og_path === "/" && pathname === "/") {
          ret.resource = resourcePathPatterns.resource;

          this.#logger.debug(
            `Found resource - resource: {}`,
            ret.resource?.constructor?.name,
          );

          this.cached_resources[url] = ret;

          this.#logger.debug(
            `Caching resource - resource: {}`,
            ret.resource?.constructor?.name,
          );

          return ret;
        }

        const pathMatchesRequestPathname = pathname.match(
          pathObj.regex_path,
        );

        if (pathMatchesRequestPathname == null) {
          continue;
        }

        ret.path_params = this.#getPathParams(
          pathObj,
          pathMatchesRequestPathname,
        );

        this.#logger.debug(
          `Found resource - resource: {}`,
          ret.resource?.constructor?.name,
        );

        ret.resource = resourcePathPatterns.resource;

        this.#logger.debug(
          `Caching resource - resource: {}`,
          ret.resource?.constructor?.name,
        );

        this.cached_resources[url] = ret;

        return ret;
      }
    }

    // TODO(crookse) What does the stack trace look like with this error thrown?
    this.#logger.trace(`Resource not found`);
    throw new HTTPError(StatusCode.NotFound);
  }

  /**
   * Get resource paths for the path in question. These paths are used to match
   * request URIs to a resource.
   *
   * @param path - The path to parse into parsable pieces.
   *
   * @return A resource paths object.
   */
  protected getResourcePaths(
    path: string,
  ): ResourcePaths {
    return {
      og_path: path,
      regex_path: `^${
        path.replace(
          REGEX_URI_MATCHES,
          REGEX_URI_REPLACEMENT,
        )
      }/?$`,
      params: (path.match(REGEX_URI_MATCHES) || []).map(
        (element: string) => {
          return element.replace(/:|{|}/g, "");
        },
      ),
    };
  }

  /**
   * Get resource paths for the path in question. The path in question should
   * have at least one optional param. An optiona param is like :id in the
   * following path:
   *
   *     /my-path/:id?
   *
   . These paths use * to match request URIs to a resource.
   *
   * @param path - The path to parse into parsable pieces.
   *
   * @return A resource paths object.
   */
  protected getResourcePathsUsingOptionalParams(
    path: string,
  ): ResourcePaths {
    // Edward Bebbington <https://github.com/ebebbington> is the mastermind
    // behind this work. Big ups!
    let tmpPath = path;
    // Replace required params, in preparation to create the `regex_path`, just
    // like how we do in the below else block
    const numberOfRequiredParams = path.split("/").filter((param) => {
      // Ignores optional (`?`) params and only pulls how many required
      // parameters the resource path contains, eg:
      //   :age? --> ignore, :age --> dont ignore, {age} --> dont ignore
      //   /users/:age/{name}/:city? --> returns 2 required params
      return (param.includes(":") || param.includes("{")) &&
        !param.includes("?");
    }).length;
    for (let i = 0; i < numberOfRequiredParams; i++) {
      tmpPath = tmpPath.replace(
        /(:[^(/]+|{[^0-9][^}]*})/, // same as REGEX_URI_MATCHES but not global
        REGEX_URI_REPLACEMENT,
      );
    }
    // Replace optional path params
    const maxOptionalParams = path.split("/").filter((param) => {
      return param.includes("?");
    }).length;
    // Description for the below for loop and why we use it to create the regex
    // for optional parameters: For each optional parameter in the path, we
    // replace it with custom regex.  Similar to how other blocks construct the
    // `regex_path`, but in this case, it isn't as easy as a simple `replace`
    // one-liner, due to needing to account for optional parameters (:name?),
    // and required parameters before optional params.  This is what we do to
    // construct the `regex_path`. I haven't been able to come up with a regex
    // that would replace all instances and work, which is why a loop is being
    // used here, to replace the first instance of an optional parameter (to
    // account for a possible required parameter before), and then replace the
    // rest of the occurrences. It's slightly tricky because the path
    // `/users/:name?/:age?/:city?` should match  `/users`.
    for (let i = 0; i < maxOptionalParams; i++) {
      // We need to mark the start for the first optional param
      if (i === 0) {
        // The below regex is very similar to `REGEX_URI_MATCHES` but this regex
        // isn't global, and accounts for there being a required parameter
        // before
        tmpPath = tmpPath.replace(
          /\/(:[^(/]+|{[^0-9][^}]*}\?)\/?/,
          // A `/` being optional, as well as the param being optional, and a
          // ending `/` being optional
          "/?([^/]+)?/?",
        );
      } else {
        // We can now create the replace regex for the rest taking into
        // consideration the above replace regex
        tmpPath = tmpPath.replace(
          /\/?(:[^(/]+|{[^0-9][^}]*}\?)\/?/,
          "([^/]+)?/?",
        );
      }
    }

    return {
      og_path: path,
      regex_path: `^${tmpPath}$`,
      // Regex is same as other blocks, but we also strip the `?`.
      params: (path.match(REGEX_URI_MATCHES) || []).map(
        (element: string) => {
          return element.replace(/:|{|}|\?/g, "");
        },
      ),
    };
  }

  /**
   * Get resource paths for the wildcard path in question. These paths are use
   * to match request URIs to a resource.
   *
   * @param path - The path to parse into parsable pieces.
   *
   * @return A resource paths object.
   */
  protected getResourcePathsUsingWildcard(
    path: string,
  ): ResourcePaths {
    return {
      og_path: path,
      regex_path: `^.${
        path.replace(
          REGEX_URI_MATCHES,
          REGEX_URI_REPLACEMENT,
        )
      }/?$`,
      params: (path.match(REGEX_URI_MATCHES) || []).map(
        (element: string) => {
          return element.replace(/:|{|}/g, "");
        },
      ),
    };
  }

  #getPathParams(
    pathObj: ResourcePaths,
    matches: string[],
  ): Record<string, string> {
    const matchesCopy = matches.slice();

    matchesCopy.shift();

    const pathParamsInKvpForm: Record<string, string> = {};

    pathObj.params.forEach((paramName: string, index: number) => {
      pathParamsInKvpForm[paramName] = matchesCopy[index];
    });

    return pathParamsInKvpForm;
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { type Builder, ResourceHandler };
