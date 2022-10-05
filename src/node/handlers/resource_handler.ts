/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
 * Copyright (C) 2022  Drash authors. The Drash authors are listed in the
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

import { AbstractResourceHandler } from "../../core/handlers/abstract_resource_handler.ts";
import { Request as DrashRequest } from "../http/request.ts";
import * as Types from "../types.ts";

const REGEX_URI_MATCHES = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, "g");
const REGEX_URI_REPLACEMENT = "([^/]+)";

/**
 * Class that handles requests that have made it to an existing resource. This
 * class ensures requests run through the chains defined by the `Resource`.
 * Resource's can have multiple chains -- one for each HTTP method they define;
 * and each of those chains can have services.
 */
export class ResourceHandler extends AbstractResourceHandler<
  DrashRequest,
  Types.ResourcePaths
> {
  /**
   * Take `this.#original.paths` and convert them to `URLPattern` objects.
   * @returns An array of `URLPattern` objects created from
   * `this.#original.paths`.
   */
  public getOriginalUrlPatterns(): Types.ResourcePaths[] {
    // Define the variable that will hold the data to helping us match path
    // params on the request during runtime
    const resourceParsedPaths: Types.ResourcePaths[] = [];

    for (let path of this.original.paths) {
      // Strip out the trailing slash from paths
      if (path.charAt(path.length - 1) == "/") {
        path = path.substring(-1, path.length - 1);
      }

      // Path isn't a string? Don't even add it...
      if (typeof path != "string") {
        throw new Error(
          `Path '${path as unknown as string}' needs to be a string.`,
        );
      }

      let paths: Types.ResourcePaths;

      // Handle wildcard paths
      if (path.includes("*") == true) {
        paths = this.getResourcePathsUsingWildcard(path);

        // Handle optional params
      } else if (path.includes("?") === true) {
        paths = this.getResourcePathsUsingOptionalParams(path);

        // Handle basic paths that don't include wild cards or optional params
      } else {
        paths = this.getResourcePaths(path);
      }

      resourceParsedPaths.push(paths);
    }

    return resourceParsedPaths;
  }

  protected getResourcePathsUsingOptionalParams(
    path: string,
  ): Types.ResourcePaths {
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
  ): Types.ResourcePaths {
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

  /**
   * Get resource paths for the path in question. These paths are use to match
   * request URIs to a resource.
   *
   * @param path - The path to parse into parsable pieces.
   *
   * @return A resource paths object.
   */
  protected getResourcePaths(
    path: string,
  ): Types.ResourcePaths {
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
}
