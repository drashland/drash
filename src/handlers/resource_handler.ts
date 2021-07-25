import * as Drash from "../../mod.ts";

const RE_URI_PATH = /(:[^(/]+|{[^0-9][^}]*})/;
const RE_URI_PATH_GLOBAL = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, "g");
const RE_URI_REPLACEMENT = "([^/]+)";

export class ResourceHandler
  implements Drash.Interfaces.ICreateable, Drash.Interfaces.IHandler {
  #resource_index: Drash.Deps.Moogle<Drash.Interfaces.IResource> = new Drash
    .Deps.Moogle<Drash.Interfaces.IResource>();

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public create(): void {
    return;
  }

  public addOptions(): void {
    return;
  }

  /**
   * Add the resources passed in via options.
   */
  public addResources(
    resources: (typeof Drash.Resource)[],
    server: Drash.Server,
  ): void {
    resources.forEach((resourceClass: typeof Drash.Resource) => {
      const resource: Drash.Interfaces.IResource = Drash.Factory
        .create(resourceClass, {
          server: server,
        });

      resource.uri_paths.forEach((path: string) => {
        // Remove the trailing slash because we handle URI paths with and without the
        // trailing slash the same. For example, the following URI paths are the same
        //
        //     /something
        //     /something/
        //
        // Some frameworks differentiate these two URI paths, but Drash does not. The
        // reason is for convenience, so that users do not have to define two
        // routes (one with and one without the trailing slash) in the same
        // resource.
        if (path.charAt(path.length - 1) == "/") {
          path = path.substring(-1, path.length - 1);
        }

        // Path isn't a string? Womp womp.
        if (typeof path != "string") {
          throw new Drash.Errors.DrashError("D1000");
        }

        // Handle wildcard paths
        // TODO(crookse) This might be broken. Figure out why.
        if (path.trim() == "*") {
          // TODO(crookse) Put this in the resource class.
          resource.uri_paths_parsed.push(
            this.getResourcePathsUsingWildcard(path),
          );

          // Handle optional params
        } else if (path.trim().includes("?")) {
          // TODO(crookse) Put this in the resource class.
          resource.uri_paths_parsed.push(
            this.getResourcePathsUsingOptionalParams(path),
          );

          // Handle basic paths that don't include wild cards or optional params
        } else {
          // TODO(crookse) Put this in the resource class.
          resource.uri_paths_parsed.push(
            this.getResourcePaths(path),
          );
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
   * Find the resource that BEST matches the given request.
   *
   * @param request - The request object.
   *
   * @return A clone of the found resource.
   */
  public createResource(
    request: Drash.Request,
  ): Drash.Interfaces.IResource | null {
    const uri = request.url.path.split("/");
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
    let results = this.#resource_index.search(baseUri);

    // If no resource was returned, then check if /:some_param is in the
    // resource index. There might be a resource with /:some_param as a URI.
    if (results.size === 0) {
      results = this.#resource_index.search("^/");
      // Still no resource found? GTFO.
      if (!results) {
        return null;
      }
    }

    // The resource index should only be returning one result, so we grab that
    // first result ...
    const result = results.entries().next().value[1];

    // ... and the item in that result is the resource.
    const resource = result.item;

    let resourceCanHandleUri = false;
    let matched: string[] = [];

    // If we matched a resource, then we need to make sure the request's URI
    // matches one of the URI paths defined on the resource. If the request's
    // URI matches one of the URI paths defined on the resource, then the
    // resource can handle the URI. Otherwise, it cannot. Womp.
    resource.uri_paths_parsed.forEach(
      (pathObj: Drash.Interfaces.IResourcePathsParsed) => {
        if (resourceCanHandleUri) {
          return;
        }

        matched = request.url.path.match(pathObj.regex_path) as string[];
        if (matched && matched.length > 0) {
          resourceCanHandleUri = true;
        }
      },
    );

    // If the resource does not have a URI defined that matches the request's
    // URI, then the resource cannot handle the request. Ultimately, this is a
    // 404 because there is no resource with the defined URI.
    if (!resourceCanHandleUri) {
      return null;
    }

    // If the matched array contains more than 1 item, then we know the request
    // includes path params. So we set those on the resource for the request
    // object to parse in `.handleRequest()`.
    let pathParams: string[] = [];
    if (matched.length > 1) {
      matched.shift();
      pathParams = matched;
    }


    return Drash.Prototype.clone(resource, {
      path_params: pathParams,
      request: request,
      server: this,
    });
  }

  /**
   * Get resource paths for the path in question. These paths are use to match
   * request URI paths to a resource.
   *
   * @param path - The path to parse into parsable pieces.
   *
   * @return A resource paths object.
   */
  protected getResourcePaths(
    path: string,
  ): Drash.Interfaces.IResourcePathsParsed {
    return {
      og_path: path,
      regex_path: `^${path.replace(RE_URI_PATH_GLOBAL, RE_URI_REPLACEMENT)}/?$`,
      params: (path.match(RE_URI_PATH_GLOBAL) || []).map((element: string) => {
        return element.replace(/:|{|}/g, "");
      }),
    };
  }

  /**
   * Get resource paths for the path in question. The path in question should
   * have at least one optional param. An optiona param is like :id in the
   * following path:
   *
   *     /my-path/:id?
   *
   . These paths are use * to match request URI paths to a resource.
   *
   * @param path - The path to parse into parsable pieces.
   *
   * @return A resource paths object.
   */
  protected getResourcePathsUsingOptionalParams(
    path: string,
  ): Drash.Interfaces.IResourcePathsParsed {
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

    return {
      og_path: path,
      regex_path: `^${tmpPath}$`,
      // Regex is same as other blocks, but we also strip the `?`.
      params: (path.match(RE_URI_PATH_GLOBAL) || []).map((element: string) => {
        return element.replace(/:|{|}|\?/g, "");
      }),
    };
  }

  /**
   * Get resource paths for the wildcard path in question. These paths are use
   * to match request URI paths to a resource.
   *
   * @param path - The path to parse into parsable pieces.
   *
   * @return A resource paths object.
   */
  protected getResourcePathsUsingWildcard(
    path: string,
  ): Drash.Interfaces.IResourcePathsParsed {
    const rePathReplaced = path.replace(RE_URI_PATH_GLOBAL, RE_URI_REPLACEMENT);
    const rePath = `^.${rePathReplaced}/?$`;

    return {
      og_path: path,
      regex_path: rePath,
      params: (path.match(RE_URI_PATH_GLOBAL) || []).map((element: string) => {
        return element.replace(/:|{|}/g, "");
      }),
    };
  }
}
