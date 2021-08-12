import * as Drash from "../../mod.ts";
import { DrashRequest } from "../http/request.ts"

const RE_URI_PATH = /(:[^(/]+|{[^0-9][^}]*})/;
const RE_URI_PATH_GLOBAL = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, "g");
const RE_URI_REPLACEMENT = "([^/]+)";

// TODO(crookse TODO-DOCBLOCK) Add docblock.
export class ResourceHandler {
  #matches: {[key: string]: Drash.Interfaces.IResource} = {};
  #resource_index: Drash.Deps.Moogle<Drash.Interfaces.IResource> = new Drash
    .Deps.Moogle<Drash.Interfaces.IResource>();

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add the given resources.
   *
   * @param resources
   * @param server - The server object to attach to the resources.
   */
  public addResources(
    resources: (typeof Drash.DrashResource)[],
    server: Drash.Server,
  ): void {
    resources.forEach(resourceClass => {
      const resource: Drash.Interfaces.IResource = new resourceClass
        ({
          server: server,
        });

      resource.uri_paths.forEach(path => {
        // Remove the trailing slash because we handle URI paths with and
        // without the trailing slash the same. For example, the following URI
        // paths are the same:
        //
        //     /something
        //     /something/
        //
        // Some frameworks differentiate these two URI paths, but Drash does
        // not. The reason is for convenience so that users do not have to
        // define two routes (one with and one without the trailing slash) in
        // the same resource.
        if (path.charAt(path.length - 1) == "/") {
          path = path.substring(-1, path.length - 1);
        }

        // Path isn't a string? Womp womp.
        if (typeof path != "string") {
          throw new Drash.Errors.DrashError("D1000");
        }

        if (this.#pathIsWildCardPath(path)) {
          this.#setPathAsWildCardPath(resource, path);
        } else if (this.#pathIsOptionalParamPath(path)) {
          this.#setPathAsOptionalParamPath(resource, path);
        } else {
          this.#setPath(resource, path);
        }
      });

      // All resources get added to an index (using Mooogle) so that they can be
      // searched for during runtime. The search terms for a resource are its
      // URI paths expanded into regex patterns so that they can be matched to
      // request URI paths. This process happens below.

      const searchTerms: string[] = [];

      resource.uri_paths_parsed
        .forEach((pathObj: Drash.Interfaces.IResourcePathsParsed) => {
          searchTerms.push(pathObj.regex_path);
        });

      this.#resource_index.addItem(searchTerms, resource);
    });
  }

  /**
   * Get the resource that BEST matches the given request.
   *
   * @param request - The request object that will be matched to a resource.
   *
   * @returns A clone of the found resource or undefined if no resource was
   * matched to the request.
   */
  public getResource(
    request: DrashRequest,
  ): Drash.Interfaces.IResource | undefined {
    // TODO :: Check the perf for this, using NEW URL might decrease perf, if so, we need another way of getting the path
    const path = new URL(request.url).pathname
    // If we already matched the request to a resource, then return the resource
    // that we matched before
    if (this.#matches[path]) {
      return this.#matches[path];
    }
    console.log('DONT MATCH')
    console.log(this.#matches)
    console.log(path)

    const uri = path.split("/");
    // Remove the first element because it is an empty string. For example:
    //
    //     ["", "uri-part-1", "uri-part-2"]
    //
    uri.shift();

    // The search term for a URI is the URI in it's most basic form. For
    // example, if the URI is /coffee/1, then the basic form of it is /coffee.
    //
    // The resource index will return all resources matching that basic URI.
    // Later down in this method, we make sure the resource can handle the URI
    // by comparing the full URI with the URI paths defined on the resource.
    const baseUri = "^/" + uri[0];

    // Find the resource
    console.log(this.#resource_index)
    console.log(baseUri)
    let results = this.#resource_index.search(baseUri);
    console.log(results)
    console.log(results.size)

    // If no resource was returned, then check if /:some_param is in the
    // resource index. There might be a resource with /:some_param as a URI.
    if (results.size === 0) {
      results = this.#resource_index.search("^/");
      console.log(results)
      // Still no resource found? GTFO.
      if (!results) {
        return;
      }
    }

    // The resource index should only be returning one result, so we grab that
    // first result ...
    const n = results.entries().next()
    console.log(n)
    const result = n.value[1];

    // ... and the item in that result is the resource.
    const resource = result.item;

    let resourceCanHandleUri = false;
    let matched: string[] = [];
    let pathParams = ""; // e.g., "hello=world&good=bye

    // If we matched a resource, then we need to make sure the request's URI
    // path matches one of the URI paths defined on the resource. If the
    // request's URI path matches one of the URI paths defined on the resource,
    // then the resource can handle the request. Otherwise, it cannot. Womp.
    resource.uri_paths_parsed.forEach(
      (pathObj: Drash.Interfaces.IResourcePathsParsed) => {
        if (resourceCanHandleUri) {
          return;
        }

        matched = path.match(pathObj.regex_path) as string[];
        if (matched && matched.length > 0) {
          const paramNames = pathObj.params ?? [];
          resourceCanHandleUri = true;

          // If we get here, then we need to check if the matched array contains
          // more than 1 item. If it does, then we know the request's URI path
          // includes path params. Knowing that, we take off the first item in
          // the matched array because the 0th item is not a path param.
          if (matched.length > 1) {
            matched.shift();

            if (paramNames.length > 0 && matched.length > 0) {
              paramNames.forEach((paramName: string, index: number) => {
                pathParams += `${paramName}=${matched[index]}&`;
              });
            }
          }
        }
      },
    );

    // If the resource does not have a URI path defined that matches the
    // request's URI path, then the resource cannot handle the request.
    // Ultimately, this is a 404 because there is no resource with the defined
    // URI path. In other words, there is no resource that can handle the
    // request.
    if (!resourceCanHandleUri) {
      return;
    }

    const clone = Drash.Prototype.clone(resource, {
      path_parameters: pathParams,
      request: request,
      server: resource.server,
    });

    // Cache the request so that subsequent requests of the same type are faster
    this.#matches[path] = clone;

    return clone;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Is the path a wild card path? Example:
   *
   * @returns True if yes, false if no.
   */
  #pathIsWildCardPath(path: string): boolean {
    return path.trim() == "*";
  }

  /**
   * Is the given path an optional param path? That is, does the path have a
   * param with a question mark at the end? Example:
   *
   *     /some-path/some_uri?
   *
   * @returns True if yes, false if no.
   */
  #pathIsOptionalParamPath(path: string): boolean {
    return path.trim().includes("?");
  }

  /**
   * Set a normal path object on the given resource.
   *
   * @param resource - The resource to set the paths on.
   * @param path - The path to parse into parsable pieces.
   */
  #setPath(
    resource: Drash.Interfaces.IResource,
    path: string,
  ): void {
    resource.uri_paths_parsed.push({
      og_path: path,
      regex_path: `^${path.replace(RE_URI_PATH_GLOBAL, RE_URI_REPLACEMENT)}/?$`,
      params: (path.match(RE_URI_PATH_GLOBAL) || []).map((element: string) => {
        return element.replace(/:|{|}/g, "");
      }),
    });
  }

  /**
   * Set an optional param path object on the given resource.
   *
   * @param resource - The resource to set the paths on.
   * @param path - The path to parse into parsable pieces.
   */
  #setPathAsOptionalParamPath(
    resource: Drash.Interfaces.IResource,
    path: string,
  ): void {
    path = path.trim();
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
      tmpPath = tmpPath.replace(RE_URI_PATH, RE_URI_REPLACEMENT);
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
        // The below regex is very similar to `RE_URI_PATH_GLOBAL` but this
        // regex isn't global, and accounts for there being a required parameter
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

    resource.uri_paths_parsed.push({
      og_path: path,
      regex_path: `^${tmpPath}$`,
      // Regex is same as other blocks, but we also strip the `?`.
      params: (path.match(RE_URI_PATH_GLOBAL) || []).map((element: string) => {
        return element.replace(/:|{|}|\?/g, "");
      }),
    });
  }

  /**
   * TODO(crookse) This method possibly is broken. Investigate.
   *
   * Set a wild card path object on the given resource.
   *
   * @param resource - The resource to set the paths on.
   * @param path - The path to parse into parsable pieces.
   */
  #setPathAsWildCardPath(
    resource: Drash.Interfaces.IResource,
    path: string,
  ): void {
    path = path.trim();

    const rePathReplaced = path.replace(RE_URI_PATH_GLOBAL, RE_URI_REPLACEMENT);
    const rePath = `^.${rePathReplaced}/?$`;

    resource.uri_paths_parsed.push({
      og_path: path,
      regex_path: rePath,
      params: (path.match(RE_URI_PATH_GLOBAL) || []).map((element: string) => {
        return element.replace(/:|{|}/g, "");
      }),
    });
  }
}
