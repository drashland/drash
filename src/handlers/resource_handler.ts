import * as Drash from "../../mod.ts";
import { Resource } from "../../mod.ts"

const RE_URI_PATH = /(:[^(/]+|{[^0-9][^}]*})/;
const RE_URI_PATH_GLOBAL = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, "g");
const RE_URI_REPLACEMENT = "([^/]+)";

// TODO(crookse TODO-DOCBLOCK) Add docblock.
export class ResourceHandler {
  #matches: Map<string, Drash.Interfaces.IResource> = new Map();
  #resource_index: Drash.Deps.Moogle<Drash.Interfaces.IResource> = new Drash
    .Deps.Moogle<Drash.Interfaces.IResource>();
  #resource_list: Map<string, Drash.Interfaces.IResource> = new Map()

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add the given resources.
   *
   * @param resources
   * @param server - The server object to attach to the resources.
   */
  public addResources(
    resources: (typeof Resource)[],
    serverOptions: Drash.Interfaces.IServerOptions,
  ): void {
    resources.forEach(resourceClass => {
      const resource: Drash.Interfaces.IResource = new resourceClass(
        resourceClass.paths
      );
      console.log('resource paths', resourceClass.paths)
      console.log('resource uri paths', resource.uri_paths)

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
          this.#resource_list.set(pathObj.regex_path, resource)
        });

      this.#resource_index.addItem(searchTerms, resource);
    });
  }

  public getMatchedPathAndParams(uri: string, resourcePaths: string[]) {
    function tryMatch(uri: string[], path: string[]): { found: boolean, matches: Map<string, string> } {
      console.debug('isnide trymatch', uri, path)
      // if url is /, and path is /, its an exACT MATCH
      if (uri.join("/") === path.join("/")) {
        return {
          found: true,
          matches: new Map()
        }
      }
      // If the url and path dont have the same parts, it isnt meant  to be,
      // eg url = /users or /users/edit/2, and path = /users/:id.
      // Also account for optional params by just ignoring them from this check
      if (uri.length !== path.filter((p: string) => p.includes('?') === false).length) {
        // this will catch when url = /2/lon/22, and path = /:id/:city/:age?
        // now include optional params and if the len isn't the same, routes deffo dont match.
        // URI should have a minimum length of the amount of req params
        if (uri.length !== path.length) 
          return {
            found: false,
            matches: new Map()
          }
      }
      // But also check that the url isn't too big for the path, eg
      // url = /users/2/edit/name, path = /users/:id/:action?, those routes dont match
      if (uri.length > path.length) {
        return {
          found: false,
          matches: new Map()
        }
      }
      // by now, the url and the path is the same length, BUT could contain different values,
      // eg url = /users/edit/2, path = /users/delete/2
      let found = true;
      const matches = new Map()
      for (const part in uri) {
        // if part in path isnt a param, it should exactly match the same position in the url, eg
        // url = /users/edit, path = /users/edit, we're iterating on the second part, both should be "edit",
        // otherwise url = /users/edit and path = /users/delete shouldn't match right?:)
        if (path[part].includes(':') === false) {
          if (uri[part] !== path[part]) {
            found = false
            break
          }
        }

        // even if we set this for a uri that doesn't match, it doesnt matter
        // because we always going to check if found is true
        if (path[part].includes(':')) {
          matches.set(path[part].replace(':', '').replace('?', ''), uri[part])
        }
      }
      return {
        found,
        matches
      }
    }
    console.log('inside getmatches', uri, resourcePaths)
    if (uri[uri.length - 1] === "/") {
      uri = uri.slice(0, -1)
    }
    let found = true;
    let par = new Map()
    for (const resourcePath of resourcePaths) {
      const res = tryMatch(uri.split("/"), resourcePath.split("/"))
      found = res.found
      par = res.matches
      if (found) { // break early, if we match first path, no need to check all others
        break
      }
    }
    if (!found) {
      return
    }
    return {
      found,
      params: par
    }
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
    request: Request,
  ): Drash.Interfaces.IResource | void {

    let path = new URL(request.url).pathname
    // strip trailing slash
    // if (path[path.length - 1] === "/") {
    //   path = path.slice(0, -1)
    // }
    console.log('pathname', path)

    // testing
    let r: Resource;
    for (const [reg, res] of this.#resource_list.entries()) {
      console.log('PATH AND REG', path, reg)
      if (`${path}`.match(reg.replace('/', '\\/'))) {
        r = res
        break
        console.log('OMG WTF WE GOT A RESOURCE,', res)
      }
    }
    // @ts-ignore
    if (r) {
      return r
    } else {
      return
    }

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
    const baseUri = "^/" + uri.join("/");

    // Find the resource
    // console.log(this.#resource_index)
    // console.log(baseUri)
    console.log('THE RESOURCE INDEX BEFORE SEARCHING', this.#resource_index)
    console.log(baseUri)
    let results = this.#resource_index.search(baseUri);
    console.log(results)
    // console.log(results)
    // console.log(results.size)

    // If no resource was returned, then check if /:some_param is in the
    // resource index. There might be a resource with /:some_param as a URI.
    if (results.size === 0) {
      results = this.#resource_index.search("^/");
      // console.log(results)
      // Still no resource found? GTFO.
      if (!results.size) {
        return;
      }
    }

    // The resource index should only be returning one result, so we grab that
    // first result ...
    const n = results.entries().next()
    // console.log(n)
    const result = n.value[1];

    // ... and the item in that result is the resource.
    const resource = result.item;
    console.log('RESOUCRCE FOUND', resource)

    const clone = Drash.Prototype.clone(resource);

    // TODO :: Maybe add caching based on perf, but we can only cache the resource found, not the params,
    //         hence there is no caching now because still still need to gen the path params
    // Example is:
    // if (this.#matches.has(path)) { return this.#matches.get(path)}
    // this.#matches.set(path, clone)

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
  // TODO(ebebbington): Think about if this logic can be moved into the resource constructor, mainly so the prop is immutable,
  //                    and i doubt it'll affect perf because if a resource has paths with params, a user is always going to hit them
  #setPath(
    resource: Drash.Interfaces.IResource,
    path: string,
  ): void {
    console.log(path, '<')
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
