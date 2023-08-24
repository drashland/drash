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

const REGEX_URI_MATCHES = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, "g");
const REGEX_URI_REPLACEMENT = "([^/]+)";

type ExecResult = {
  pathname?: {
    groups: Record<string, string | undefined>;
  };
};

type ResourcePathPatterns = {
  og_path: string;
  regex_path: string;
  params: string[];
};

class URLPatternPolyfill {
  #resource_path_patterns: ResourcePathPatterns[] = [];

  public readonly pathname: string;

  constructor(options: { pathname: string }) {
    options.pathname = options.pathname.replace("{/}?", "");
    this.#resource_path_patterns.push(this.#getResourcePaths(options.pathname));
    this.#resource_path_patterns.push(
      this.#getResourcePathsUsingOptionalParams(options.pathname),
    );
    this.#resource_path_patterns.push(
      this.#getResourcePathsUsingWildcard(options.pathname),
    );
    this.pathname = options.pathname;
  }

  exec(url: string): ExecResult | null {
    const { pathname } = new URL(url);

    for (const pathObj of this.#resource_path_patterns) {
      const matches = pathname.match(pathObj.regex_path);

      if (matches == null) {
        continue;
      }

      return {
        pathname: {
          groups: this.#getPathParams(pathObj, matches),
        },
      };
    }

    return null;
  }

  /**
   * Get resource paths for the path in question. These paths are used to match
   * request URIs to a resource.
   *
   * @param path - The path to parse into parsable pieces.
   *
   * @return A resource paths object.
   */
  #getResourcePaths(path: string): ResourcePathPatterns {
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
  #getResourcePathsUsingOptionalParams(path: string): ResourcePathPatterns {
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
  #getResourcePathsUsingWildcard(path: string): ResourcePathPatterns {
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
    pathObj: ResourcePathPatterns,
    matches: string[],
  ): Record<string, string> {
    const matchesCopy = matches.slice();

    matchesCopy.shift();

    const pathParams: Record<string, string> = {};

    pathObj.params.forEach((paramName: string, index: number) => {
      pathParams[paramName] = matchesCopy[index];
    });

    return pathParams;
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { URLPatternPolyfill };
