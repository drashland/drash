import * as Drash from "../../mod.ts";

const RE_URI_PATH = /(:[^(/]+|{[^0-9][^}]*})/;
const RE_URI_PATH_GLOBAL = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, "g");
const RE_URI_REPLACEMENT = "([^/]+)";

// TODO(crookse) Remove this. We don't need this. Just set the services
// accordingly. I don't know what that means right now, but maybe I'll know what
// that means later.
interface IServices {
  external: {
    after_request: Drash.Interfaces.IService[];
    before_request: Drash.Interfaces.IService[];
  };
  internal: {
    resource_index: Drash.Deps.Moogle<Drash.Interfaces.IResource>;
  };
}

/**
 * This class handles the entire request-resource-response lifecycle. It is in
 * charge of handling incoming requests, matching them to resources for further
 * processing, and sending responses based on the processes set in the resource.
 * It is also in charge of sending error responses that "bubble up" during the
 * request-resource-response lifecycle.
 */
export class Server implements Drash.Interfaces.IServer {
  /**
   * See Drash.Interfaces.IServerOptions.
   */
  public options: Drash.Interfaces.IServerOptions = {};

  /**
   * The Deno server object (after calling `serve()`).
   */
  // @ts-ignore: See mod.ts TS IGNORE NOTES > NOTE 1.
  protected deno_server: Drash.Deps.Server;

  /**
   * The Deno server request object handler. This handler gets wrapped around
   * the Deno server request object and acts as a proxy to interact with the
   * Deno server request object.
   *
   * The Drash.Request object is not actually a request object. Surprise!
   */
  protected request: Drash.Request = Drash.Factory.create(Drash.Request);

  /**
   * The internal and external services used by this server. Internal services
   * are ones created by Drash. External services are ones specified by the
   * user.
   */
  protected services: IServices = {
    external: {
      after_request: [],
      before_request: [],
    },
    internal: {
      resource_index: new Drash.Deps.Moogle<Drash.Interfaces.IResource>(),
    },
  };

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - FACTORY METHODS /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * See Drash.Interfaces.ICreateable.addOptions().
   */
  public addOptions(options: Drash.Interfaces.IServerOptions): void {
    if (!options.default_response_content_type) {
      options.default_response_content_type = "application/json";
    }

    if (!options.hostname) {
      options.hostname = "0.0.0.0";
    }

    if (!options.memory) {
      options.memory = {};
    }

    if (!options.memory.multipart_form_data) {
      options.memory.multipart_form_data = 10;
    }

    if (!options.port) {
      options.port = 1337;
    }

    if (!options.resources) {
      options.resources = [];
    }

    if (!options.services) {
      options.services = {
        after_request: [],
        before_request: [],
      };
    }

    this.options = options;
  }

  /**
   * See Drash.Interfaces.ICreateable.create().
   */
  public create(): void {
    this.addExternalServices();
    this.addResources();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Close the server.
   */
  public close(): void {
    try {
      this.deno_server.close();
    } catch (_error) {
      // Do nothing. The server was probably already closed.
    }
  }

  /**
   * Get the full address that this server is running on.
   *
   * @returns The address (e.g., https://localhost:1337).
   */
  public getAddress(): string {
    return `${this.options.protocol}://${this.options.hostname}:${this.options.port}`;
  }

  /**
   * Handle errors thrown during runtime. These errors get sent as the response
   * to the client.
   *
   * @param request - The request object.
   * @param error - The error that was thrown during runtime.
   */
  public handleError(
    request: Drash.Deps.ServerRequest,
    error: Drash.Errors.HttpError,
  ) {
    // TODO(crookse) The error should be a response object so we can
    // request.respond(error);
    request.respond({
      status: error.code,
      body: error.message,
    });
  }

  /**
   * Handle an HTTP request from the Deno server.
   *
   * TODO (crookse) Add in the middleware. Middleware is now called serices. So,
   * technically, add in the services.
   *
   * @param originalRequest - The Deno request object.
   */
  public async handleRequest(
    originalRequest: Drash.Deps.ServerRequest,
  ): Promise<any> {
    const request = await this.buildRequest(originalRequest);

    const resource = this.findResource(request);

    this.setRequestPathParams(request, resource);

    const method = request.method.toUpperCase();

    // If the method does not exist on the resource, then the method is not
    // allowed. So, throw that 405 and GTFO.
    if (!(method in resource)) {
      throw new Drash.Errors.HttpError(405);
    }

    const response = await resource![method as Drash.Types.THttpMethod]!();
    const body = await response.parseBody();

    originalRequest.respond({
      status: response.status,
      headers: response.headers,
      body: body,
    });
  }

  /**
   * Run the server in HTTP mode.
   *
   * @returns The Deno server object.
   */
  public async runHttp(): Promise<Drash.Deps.Server> {
    this.options.protocol = "http";

    this.deno_server = Drash.Deps.serve({
      hostname: this.options.hostname!,
      port: this.options.port!,
    });

    await this.listenForRequests();

    return this.deno_server;
  }

  /**
   * Run the server in HTTPS mode.
   *
   * @returns The Deno server object.
   */
  public async runHttps(): Promise<Drash.Deps.Server> {
    this.options.protocol = "https";

    this.deno_server = Drash.Deps.serveTLS({
      hostname: this.options.hostname!,
      port: this.options.port!,
      certFile: this.options.cert_file!,
      keyFile: this.options.key_file!,
    });

    await this.listenForRequests();

    return this.deno_server;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PROTECTED METHODS ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add the external services passed in via options.
   */
  protected async addExternalServices(): Promise<void> {
    // No services? GTFO.
    if (!this.options.services) {
      return;
    }

    // Add server-level services that execute before all requests
    if (this.options.services.before_request) {
      await this.addExternalServicesBeforeRequest(
        this.options.services.before_request,
      );
    }

    // Add server-level services that execute after all requests
    if (this.options.services.after_request) {
      await this.addExternalServicesAfterRequest(
        this.options.services.after_request,
      );
    }
  }

  /**
   * Add the external services that should execute after a request.
   *
   * @param services - An array of Service types.
   */
  protected async addExternalServicesAfterRequest(
    services: typeof Drash.Service[],
  ): Promise<void> {
    for (const s of services) {
      // TODO(crookse) Make this new call use the Factory.
      // @ts-ignore
      const service = new (s as Drash.Interfaces.IService)();
      // Check if this service needs to be set up
      if (service.setUp) {
        await service.setUp();
      }
      this.services.external.after_request!.push(service);
    }
  }

  /**
   * Add the external services that should execute before a request.
   *
   * @param services - An array of Service types.
   */
  protected async addExternalServicesBeforeRequest(
    services: typeof Drash.Service[],
  ): Promise<void> {
    for (const s of services) {
      // TODO(crookse) Make this new call use the Factory.
      // @ts-ignore
      const service = new (s as Drash.Interfaces.IService)();
      // Check if this service needs to be set up
      if (service.setUp) {
        await service.setUp();
      }
      this.services.external.before_request!.push(service);
    }
  }

  /**
   * Add the resources passed in via options.
   */
  protected addResources(): void {
    // No resources? Lolz. This means the / URI will throw a 404 Not Found.
    if (!this.options.resources) {
      return;
    }

    this.options.resources.forEach((resourceClass: typeof Drash.Resource) => {
      // @ts-ignore
      const resource: Drash.Interfaces.IResource = Drash.Factory
        .create(resourceClass, {
          server: this,
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

      this.services.internal.resource_index.addItem(searchTerms, resource);
    });
  }

  /**
   * Build the request object.
   *
   * @param originalRequest - Deno's request object.
   *
   * @returns See Drash.Request.
   */
  protected async buildRequest(
    originalRequest: Drash.Deps.ServerRequest,
  ): Promise<Drash.Request> {
    return await this.request.clone({
      original_request: originalRequest,
      memory: {
        multipart_form_data: this.options.memory!.multipart_form_data!,
      },
    });
  }

  /**
   * Execute server-level services after the request.
   *
   * @param request - The request object.
   * @param resource - The resource object.
   */
  // protected async executeApplicationServicesAfterRequest(
  //   request: any,
  //   response: Response,
  // ): Promise<void> {
  //   if (!this.services.external.after_request) {
  //     return;
  //   }

  //   for (const index in this.services.external.after_request) {
  //     const service = this.services.external.after_request[index];
  //     if (service.runAfterRequest) {
  //       service.runAfterRequest(request, response);
  //     }
  //   }
  // }

  /**
   * Execute server-level services before the request.
   *
   * @param request - The request object.
   * @param resource - The resource object.
   */
  // protected async executeApplicationServicesBeforeRequest(
  //   request: Request,
  // ): Promise<void> {
  //   if (!this.services.external.before_request) {
  //     return;
  //   }

  //   for (const index in this.services.external.before_request) {
  //     const service = this.services.external.before_request[index];
  //     if (service.runBeforeRequest) {
  //       service.runBeforeRequest(request);
  //     }
  //   }
  // }

  /**
   * Find the resource that BEST matches the given request.
   *
   * @param request - The request object.
   *
   * @return A clone of the found resource.
   */
  protected findResource(request: Drash.Request): Drash.Interfaces.IResource {
    const uri = request.url_path.split("/");
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
    let results = this.services.internal.resource_index.search(baseUri);

    // If no resource was returned, then check if /:some_param is in the
    // resource index. There might be a resource with /:some_param as a URI.
    if (results.size === 0) {
      results = this.services.internal.resource_index.search("^/");
      // Still no resource found? GTFO.
      if (!results) {
        throw new Drash.Errors.HttpError(404);
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

        matched = request.url_path.match(pathObj.regex_path) as string[];
        if (matched && matched.length > 0) {
          resourceCanHandleUri = true;
        }
      },
    );

    // If the resource does not have a URI defined that matches the request's
    // URI, then the resource cannot handle the request. Ultimately, this is a
    // 404 because there is no resource with the defined URI.
    if (!resourceCanHandleUri) {
      throw new Drash.Errors.HttpError(404);
    }

    // If the matched array contains more than 1 item, then we know the request
    // includes path params. So we set those on the resource for the request
    // object to parse in `.handleRequest()`.
    let pathParams: string[] = [];
    if (matched.length > 1) {
      matched.shift();
      pathParams = matched;
    }

    return resource.clone({
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

  /**
   * Listens for incoming HTTP connections on the server property
   */
  protected async listenForRequests() {
    for await (const request of this.deno_server) {
      try {
        await this.handleRequest(request);
      } catch (error) {
        await this.handleError(request, error);
      }
    }
  }

  /**
   * TODO(crookse) This method should probably be on the request.
   *
   * Set the `request.path_params` property after finding the given resource so
   * the user can access them via `this.request.getPathParamValue()`.
   *
   * How it works: If we have the following request URI ...
   *
   *     /hello/world/i-love-you
   *
   * and it was matched to a resource with the following URI ...
   *
   *    /hello/:thing/:greeting
   *
   * then we end up with two arrays ...
   *
   *     resource's defined path params: [ "thing", "greeting" ]
   *     request's given path params:    [ "world", "i-love-you" ]
   *
   * that get merged merged into key-value pairs ...
   *
   *     { thing: "world", greeting: "i-love-you" }
   *
   * The first array serves as the keys and the second array serves the value of
   * the keys.
   *
   * @param request - The request object.
   * @param resource - The resource object.
   */
  protected setRequestPathParams(
    request: Drash.Interfaces.IRequest,
    resource: Drash.Interfaces.IResource,
  ): void {
    resource.uri_paths_parsed.forEach(
      (pathObj: Drash.Interfaces.IResourcePathsParsed) => {
        pathObj.params.forEach((paramName: string, index: number) => {
          request.path_params[paramName] = resource.path_params[index];
        });
      },
    );
  }
}
