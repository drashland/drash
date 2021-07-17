import { Factory } from "../gurus/factory.ts";
import { Response } from "./response.ts";
import { Resource } from "./resource.ts";
import { Request } from "./request.ts";
import { Service } from "./service.ts";
import { CompileError, HttpError } from "../errors.ts";
import {
  ICreateable,
  ICreateableOptions,
  IResource,
  IResourcePaths,
  IResponseOutput,
  IServerOptions,
  IServerOptionsServices,
  IService,
} from "../interfaces.ts";
import {
  ConsoleLogger,
  HTTPOptions,
  HTTPSOptions,
  Moogle,
  serve,
  Server as DenoServer,
  ServerRequest,
  serveTLS,
} from "../../deps.ts";

type TServiceInternal = Moogle<ICreateable>;

interface IServices {
  external: {
    after_request: IService[],
    before_request: IService[],
  };
  internal: {
    resource_index: Moogle<ICreateable>
  };
}

class HomeResource extends Resource {
  static paths = ["/"];

  public GET() {
    this.response.body = "test internal";
    return this.response;
  }
}

/**
 * Server handles the entire request-resource-response lifecycle. It is in
 * charge of handling HTTP requests to resources, static paths, sending
 * appropriate responses, and handling errors that bubble up within the
 * request-resource-response lifecycle.
 */
export class Server implements ICreateable {
  static REGEX_URI_MATCHES = new RegExp(/(:[^(/]+|{[^0-9][^}]*})/, "g");
  static REGEX_URI_REPLACEMENT = "([^/]+)";

  /**
   * A property to hold the Deno server. This property is set in
   * this.run() like so:
   *
   *     this.deno_server = serve(HTTPOptions);
   *
   * serve() is imported from https://deno.land/x/http/server.ts.
   */
  public deno_server: DenoServer | null = null;

  /**
   * A property to hold this server's options.
   */
  public options: IServerOptions = {};

  /**
   * A property to hold this server's services. This is not to be confused with
   * the services that are provided in the options.
   */
  protected services: IServices = {
    external: {
      after_request: [],
      before_request: [],
    },
    internal: {
      resource_index: new Moogle<ICreateable>()
    }
  };

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - FACTORY METHODS /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Build the options for this server -- making sure to set any necessary
   * defaults in case the user did not provide any options.
   *
   * @param options - The options passed in by the user.
   *
   * @return The options.
   */
  public create(): void {
    this.addExternalServices();
    this.addResources();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public getAddress(): string {
    return `${this.options.protocol}://${this.options.hostname}:${this.options.port}`;
  }

  /**
   * Handle an HTTP request from the Deno server.
   *
   * @param serverRequest - The incoming request object.
   *
   * @returns A Promise of IResponseOutput. See IResponseOutput
   * for more information.
   */
  public async handleRequest(originalRequest: ServerRequest): Promise<any> {
    const request = this.buildRequest(originalRequest);

    // if (request.url == "/favicon.ico") {
    //   return;
    // }

    const resource = this.buildResource(request);

    // // @ts-ignore
    // const response = await resource[request.method.toUpperCase()]();

    // const body = (typeof response.body == "string")
    //   ? response.body
    //   : JSON.stringify(response.body);

    originalRequest.respond({
      // status_code: response.status_code,
      // status: response.status,
      headers: new Headers(),
      body: "hello world!"
    });

    //   await this.executeApplicationServicesBeforeRequest(request);

    //   // Does the HTTP method exist on the resource?
    //   if (
    //     typeof (resource as unknown as { [key: string]: unknown })[
    //       request.method.toUpperCase()
    //     ] !== "function"
    //   ) {
    //     throw new HttpError(405);
    //   }

    //   // @ts-ignore
    //   // Make the request. Also, we ignore this because resource doesn't have an
    //   // index.
    //   // const clone = resource;
    //   // clone.request = request;
    //   // clone.response = response;

    //   // clone[method]();

    //   response = await resource[request.method.toUpperCase()]();

    //   this.isValidResponse(request, response, resource);

    //   await this.executeApplicationServicesAfterRequest(request, response);

    //   return response.send();
    // } catch (error) {
    //   return await this.handleHttpRequestError(
    //     request,
    //     new HttpError(error.code ?? 400, error.message),
    //   );
    // }
  }

  /**
   * Run the Deno server at the hostname specified in the options. This method
   * takes each HTTP request and creates a new and more workable request object
   * and passes it to `.handleHttpRequest()`.
   *
   * @param options - The HTTPOptions interface from https://deno.land/std/http/server.ts.
   *
   * @returns A Promise of the Deno server from the serve() call.
   */
  public async runHttp(): Promise<DenoServer> {
    this.options.protocol = "http";

    this.deno_server = serve({
      hostname: this.options.hostname!,
      port: this.options.port!,
    });

    await this.listenForRequests();
    return this.deno_server;
  }

  /**
   * Run the Deno server at the hostname specified in the options as an HTTPS
   * Server. This method takes each HTTP request and creates a new and more
   * workable request object and passes it to `.handleHttpRequest()`.
   *
   * @param options - The HTTPSOptions interface from https://deno.land/std/http/server.ts.
   *
   * @returns A Promise of the Deno server from the serve() call.
   */
  public async runHttps(): Promise<DenoServer> {
    this.options.protocol = "https";

    this.deno_server = serveTLS({
      hostname: this.options.hostname!,
      port: this.options.port!,
      certFile: this.options.cert_file!,
      keyFile: this.options.key_file!,
    });

    await this.listenForRequests();
    return this.deno_server;
  }

  /**
   * Close the server.
   */
  public close(): void {
    this.deno_server!.close();
    this.deno_server = null;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
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
        this.options.services.before_request
      );
    }

    // Add server-level services that execute after all requests
    if (this.options.services.after_request) {
      await this.addExternalServicesAfterRequest(
        this.options.services.after_request
      );
    }
  }

  /**
   * Add the external services that should execute after a request.
   *
   * @param services - An array of Service types.
   */
  protected async addExternalServicesAfterRequest(
    services: typeof Service[]
  ): Promise<void> {
    for (const s of services) {
      // @ts-ignore
      const service = new (s as IService)();
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
    services: typeof Service[]
  ): Promise<void> {
    for (const s of services) {
      // @ts-ignore
      const service = new (s as IService)();
      // Check if this service needs to be set up
      if (service.setUp) {
        await service.setUp();
      }
      this.services.external.before_request!.push(service);
    }
  }

  /**
   * Add an HTTP resource to the server which can be retrieved at specific
   * URIs.
   *
   * Drash defines an HTTP resource according to the MDN Web docs
   * [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web).
   *
   * @param resourceClass - A child object of the `Resource` class.
   */
  protected addResource(resourceClass: IResource): void {
    // Define the variable that will hold the data to helping us match path
    // params on the request during runtime
    const resourceParsedPaths = [];

    if (!resourceClass.paths) {
      throw new CompileError("D1001");
    }

    for (let path of resourceClass.paths) {
      // Strip out the trailing slash from paths
      if (path.charAt(path.length - 1) == "/") {
        path = path.substring(-1, path.length - 1);
      }

      // Path isn't a string? Womp womp.
      if (typeof path != "string") {
        throw new CompileError("D1000");
      }

      let paths: IResourcePaths;

      // Handle wildcard paths
      if (path.trim().includes("*")) {
        paths = this.getResourcePathsUsingWildcard(path);

        // Handle optional params
      } else if (path.trim().includes("?")) {
        paths = this.getResourcePathsUsingOptionalParams(path);

        // Handle basic paths that don't include wild cards or optional params
      } else {
        paths = this.getResourcePaths(path);
      }

      resourceParsedPaths.push(paths);

      // Include the regex path in the index, so we can search for the regex
      // path during runtime in `.findResource()`
      this.services.internal.resource_index.addItem(
        [paths.regex_path],
        resourceClass,
      );
    }

    // Make sure we set the parsed paths so we can use it during runtime to
    // match request path params
    resourceClass.paths_parsed = resourceParsedPaths;
  }

  /**
   * Add the resources passed in via options.
   */
  protected addResources(): void {
    // No resources? Lolz. This means the / URI will throw a 404 Not Found.
    if (!this.options.resources) {
      return;
    }

    for (const index in this.options.resources) {
      this.addResource(this.options.resources[index] as unknown as ICreateable);
    }
  }

  public addOptions(options: IServerOptions): void {
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
      }
    }

    this.options = options;
  }


  protected buildRequest(originalRequest: ServerRequest): Request {
    return Factory.create(Request, {
      original_request: originalRequest,
      memory: {
        multipart_form_data: this.options.memory!.multipart_form_data!,
      }
    });
  }

  /**
   * Get the resource class.
   *
   * @param request - The request object.
   *
   * @returns A `Resource` object if the URL path of the request can
   * be matched to a `Resource` object's paths. Otherwise, it returns
   * `undefined` if a `Resource` object can't be matched.
   */
  protected buildResource(request: Request): void {
    let resourceClass = this.findResource(request);

    // @ts-ignore
    return Factory.create(resourceClass, {
      request: request,
      server: this,
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
   * The the resource that will handled the specified request based on the
   * request's URI.
   *
   * @param request - The request object.
   *
   * @return The resource as a constructor function to be used in
   * `.buildResource()`.
   */
  protected findResource(request: Request): Resource {
    let resource: Resource | undefined = undefined;

    const uri = request.url_path.split("/");
    // Remove the first element which would be ""
    uri.shift();

    // The search term for a URI is the URI in it's most basic form. Basically,
    // just "/something" instead of "/something/blah/what/ok?hello=world". The
    // resource index service will return all resources matching that basic URI.
    // Later down in this method, we iterate over each result that the resource
    // index service returns to find the best matching resource to the request
    // URL. Notice, we're searching for a URI at first and then matching against
    // a URL later.
    const uriWithoutParams = "^/" + uri[0];

    let results = this.services.internal.resource_index
      .search(uriWithoutParams);

    // If no results are found, then check if /:some_param is in the index
    // service's lookup table because there might be a resource with
    // /:some_param as a URI
    if (results.size === 0) {
      results = this.services.internal.resource_index.search("^/");
      // Still no resource found? GTFO.
      if (!results) {
        throw new HttpError(404);
      }
    }

    // Find the matching resource by comparing the request URL to a regex
    // pattern associated with a resource
    let matchedResource = false;
    // @ts-ignore
    // TODO(crookse) Export SearchResult type from Moogle so we can use it
    // instead of using `any`
    results.forEach((result: any) => {
      // If we already matched a resource, then there is no need continue
      // looking
      if (matchedResource) {
        return;
      }

      // Take the current result and see if it matches against the request URL
      const matchArray = request.url_path.match(
        result.searchTerm,
      );

      // If the request URL and result matched, then we know this result that we
      // are currently parsing contains the resource we are looking for
      if (matchArray) {
        matchedResource = true;
        resource = result.item;
        request.path_params = this.getRequestPathParams(
          resource,
          matchArray,
        );
      }
    });

    if (!resource) {
      throw new HttpError(404);
    }

    return resource;
  }

  /**
   * Get the path params in a request URL.
   *
   * @param resource - The resource that has the information about param names.
   * These param names are associated with the values of the path params in the
   * request URL.
   * @param matchArray - An array containing the path params (as well as other
   * information about the request URL).
   */
  protected getRequestPathParams(
    resource: IResource | undefined,
    matchArray: RegExpMatchArray | null,
  ): { [key: string]: string } {
    const pathParamsInKvpForm: { [key: string]: string } = {};

    // No need to get params if there aren't any
    if (!matchArray || (matchArray.length == 1)) {
      return pathParamsInKvpForm;
    }

    const params = matchArray.slice();
    params.shift();

    if (resource && resource.paths_parsed) {
      resource.paths_parsed.forEach(
        (pathObj: IResourcePaths) => {
          pathObj.params.forEach((paramName: string, index: number) => {
            pathParamsInKvpForm[paramName] = params[index];
          });
        },
      );
    }
    return pathParamsInKvpForm;
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
  ): IResourcePaths {
    return {
      og_path: path,
      regex_path: `^${
        path.replace(
          Server.REGEX_URI_MATCHES,
          Server.REGEX_URI_REPLACEMENT,
        )
      }/?$`,
      params: (path.match(Server.REGEX_URI_MATCHES) || []).map(
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
   . These paths are use * to match request URIs to a resource.
   *
   * @param path - The path to parse into parsable pieces.
   *
   * @return A resource paths object.
   */
  protected getResourcePathsUsingOptionalParams(
    path: string,
  ): IResourcePaths {
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
        Server.REGEX_URI_REPLACEMENT,
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
      params: (path.match(Server.REGEX_URI_MATCHES) || []).map(
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
  protected getResourcePathsUsingWildcard(path: string): IResourcePaths {
    return {
      og_path: path,
      regex_path: `^.${
        path.replace(
          Server.REGEX_URI_MATCHES,
          Server.REGEX_URI_REPLACEMENT,
        )
      }/?$`,
      params: (path.match(Server.REGEX_URI_MATCHES) || []).map(
        (element: string) => {
          return element.replace(/:|{|}/g, "");
        },
      ),
    };
  }

  /**
   * Listens for incoming HTTP connections on the server property
   */
  protected async listenForRequests() {
    for await (const request of this.deno_server!) {
      try {
        this.handleRequest(request);
      } catch (error) {
        // this.handleHttpRequestError(
        //   request as any,
        //   new HttpError(500),
        // );
      }
    }
  }
}
