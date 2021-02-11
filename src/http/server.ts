import { Drash } from "../../mod.ts";
import {
  ConsoleLogger,
  HTTPOptions,
  HTTPSOptions,
  IndexService,
  ISearchResult,
  serve,
  Server as DenoServer,
  ServerRequest,
  serveTLS,
} from "../../deps.ts";
import type { ServerMiddleware } from "../interfaces/server_middleware.ts";
import { IOptions as IRequestOptions } from "./request.ts";

interface IServices {
  http_service: Drash.Services.HttpService;
  resource_index_service: IndexService;
}

/**
 * Server handles the entire request-resource-response lifecycle. It is in
 * charge of handling HTTP requests to resources, static paths, sending
 * appropriate responses, and handling errors that bubble up within the
 * request-resource-response lifecycle.
 */
export class Server {
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
   * The hostname of the Deno server.
   */
  public hostname: string = "localhost";

  /**
   * The port of the Deno server.
   */
  public port: number = 1447;

  /**
   * A property to hold this server's configs.
   */
  protected configs: Drash.Interfaces.ServerConfigs;

  /**
   * A property to hold server-level middleware. This includes the following
   * middleware types:
   *
   *     - after request
   *     - after resource
   *     - before request
   *     - compile time
   *     - runtime
   */
  protected middleware: ServerMiddleware = {
    runtime: new Map<
      number,
      ((
        request: Drash.Http.Request,
        response: Drash.Http.Response,
      ) => Promise<void>)
    >(),
  };

  /**
   * A property to hold this server's services.
   */
  protected services: IServices = {
    http_service: new Drash.Services.HttpService(),
    resource_index_service: new IndexService(
      new Map<number, Drash.Interfaces.Resource>(),
    ),
  };

  /**
   * This server's list of static paths. HTTP requests to a static path are
   * usually intended to retrieve some type of concrete resource (e.g., a
   * CSS file or a JS file). If an HTTP request is matched to a static path
   * and the resource the HTTP request is trying to get is found, then
   * Drash.Http.Response will use its sendStatic() method to send the
   * static asset back to the client.
   *
   * TODO(crookse) Change this to a Map.
   */
  protected static_paths: string[] | { [key: string]: string } = [];

  /**
   * This server's list of static paths as virtual paths. Virtual paths allow
   * users to map a path that does not exist to a physical path on their
   * filesystem. This is helpful when you want to structure your application's
   * filesystem in a way that separates sever- and client-side code. Instead of
   * giving end users access to your entire filesystem, you can give them access
   * to specific directories by using virtual paths. Also, see
   * `this.static_paths` for more information.
   */
  protected virtual_paths: Map<string, string> = new Map<string, string>();

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param configs - The config of Drash Server
   */
  constructor(configs: Drash.Interfaces.ServerConfigs) {
    this.configs = this.buildConfigs(configs);

    this.addMiddleware();

    this.addResources();

    this.addStaticPaths();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Handle an HTTP request from the Deno server.
   *
   * @param serverRequest - The incoming request object.
   *
   * @returns A Promise of ResponseOutput.
   */
  public async handleHttpRequest(
    serverRequest: ServerRequest,
  ): Promise<Drash.Interfaces.ResponseOutput> {
    const request = await this.buildRequest(serverRequest);
    let response = this.buildResponse(request);

    try {
      await this.executeMiddlewareBeforeRequest(request);

      // Is this request for the favicon?
      if (request.url == "/favicon.ico") {
        return await this.handleHttpRequestForFavicon(request);
      }

      // Is this request for a static asset?
      if (this.requestTargetsStaticPath(request)) {
        return await this.handleHttpRequestForStaticPathAsset(request);
      }

      // Is this request for a virtual path asset?
      if (this.requestTargetsVirtualPath(request)) {
        return await this.handleHttpRequestForVirtualPathAsset(request);
      }

      // If all conditions above fail, then a resource is likely being requested
      return await this.handleHttpRequestForResource(request, response);
    } catch (error) {
      return await this.handleHttpRequestError(
        request,
        new Drash.Exceptions.HttpException(error.code ?? 400, error.message),
      );
    }
  }

  /**
   * Handle cases when an error is thrown when handling an HTTP request.
   *
   * @param request - The request object.
   * @param error - The error object.
   * @param resource - (optional) Pass in the resource that threw the error.
   * @param response - (optional) Pass in the response that threw the error.
   *
   * @returns A Promise of ResponseOutput.
   */
  public async handleHttpRequestError(
    request: Drash.Http.Request,
    error: Drash.Exceptions.HttpException,
    resource: Drash.Http.Resource | null = null,
    response: Drash.Http.Response | null = null,
  ): Promise<Drash.Interfaces.ResponseOutput> {
    this.log(
      `Error occurred while handling request: ${request.method} ${request.url}`,
    );
    this.log(error.message);
    if (error.stack) {
      this.log("Stack trace below:");
      this.log(error.stack);
    }

    this.log("Generating generic error response object.");

    // If a resource was found, but an error occurred, then that's most likely
    // due to the HTTP method not being defined in the resource class;
    // therefore, the method is not allowed. In this case, we send a 405
    // (Method Not Allowed) response.
    if (resource) {
      if (!response) {
        const resourceObj =
          // TODO(crookse) Might need to look over this typing again
          (resource as unknown) as { [key: string]: Drash.Interfaces.Resource };
        const method = request.method.toUpperCase();
        if (typeof resourceObj[method] !== "function") {
          error = new Drash.Exceptions.HttpException(405);
        }
      }
    }

    response = this.buildResponse(request);
    response.status_code = error.code ? error.code : 500;
    response.body = error.message ? error.message : response.getStatusMessage();

    this.log(
      `Sending response. Content-Type: ${
        response.headers.get(
          "Content-Type",
        )
      }. Status: ${response.getStatusMessageFull()}.`,
    );

    try {
      await this.executeMiddlewareAfterRequest(request, response);
    } catch (error) {
      // Do nothing. The `executeMiddlewareAfterRequest()` method is
      // run once in `handleHttpRequest()`. We run this method a second time
      // here in case the server has middleware that needs to run (e.g.,
      // logging middleware) without throwing uncaught exceptions. This is a bit
      // hacky, but it works. Refactor when needed.
    }

    return response.send();
  }

  /**
   * Handle HTTP requests for the favicon. This method only exists to
   * short-circuit favicon requests--preventing the requests from clogging
   * the logs.
   *
   * @param request - The request object
   *
   * @returns The response as stringified JSON. This is only used for
   * unit testing purposes.
   */
  public async handleHttpRequestForFavicon(
    request: Drash.Http.Request,
  ): Promise<Drash.Interfaces.ResponseOutput> {
    const response = this.buildResponse(request);
    response.body = "";
    response.headers = new Headers();
    response.status_code = 200;

    response.headers.set("Content-Type", "image/x-icon");

    try {
      response.body = await Deno.readFile(
        `${await Deno.realPath(".")}/favicon.ico`,
      );
    } catch (error) {
    }

    return response.send();
  }

  public async handleHttpRequestForResource(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
  ): Promise<Drash.Interfaces.ResponseOutput> {
    this.log(
      `Request received: ${request.method.toUpperCase()} ${request.url}`,
    );

    const resource = this.buildResource(request, response);

    // TODO(crookse) In v2, this is where the before_request middleware hook
    // will be placed. The current location of the before_request middleware
    // hook will be replaced with a before_resource middleware hook.
    await this.executeMiddlewareAfterResource(request, response);

    // Does the HTTP method exist on the resource?
    if (
      typeof (resource as unknown as { [key: string]: unknown })[
        request.method.toUpperCase()
      ] !== "function"
    ) {
      throw new Drash.Exceptions.HttpException(405);
    }

    this.log("Calling " + request.method.toUpperCase() + "().");

    // @ts-ignore
    response = await resource[request.method.toUpperCase()]();

    // Check if the response returned is of type Drash.Http.Response, or as
    // Drash.Interfaces.ResponseOutput
    this.isValidResponse(request, response, resource);

    await this.executeMiddlewareAfterRequest(request, response);

    this.log("Sending response. " + response.status_code + ".");
    return response.send();
  }

  /**
   * Handle HTTP requests for static path assets.
   *
   * @param request - The request object
   *
   * @returns The response as stringified JSON. This is only used for unit
   * testing purposes.
   */
  public async handleHttpRequestForStaticPathAsset(
    request: Drash.Http.Request,
  ): Promise<Drash.Interfaces.ResponseOutput> {
    const response = this.buildResponse(request);

    try {
      response.headers.set(
        "Content-Type",
        this.services.http_service.getMimeType(request.url, true) ||
          "text/plain",
      );

      // Two things are happening here:
      // 1. If pretty_links is not enabled, then serve what was requested; or
      // 2. If the request.url has an extension (e.g., .js), then serve the
      // requested asset. Since this occurs after the MIME code above, the
      // client should receive a proper response in the proper format.
      if (!this.configs.pretty_links || request.url.split(".")[1]) {
        try {
          // Try to read the file if it exists
          response.body = await Deno.readFile(
            `${this.configs.directory}/${request.url}`,
          );
          await this.executeMiddlewareAfterRequest(
            request,
            response,
          );
        } catch (error) {
          // If the file doesn't exist, run the middleware just in case
          // ServeTypeScript is being used. If it's being used, then the
          // middleware will return a response body.
          await this.executeMiddlewareAfterRequest(
            request,
            response,
          );
        }
        // If there's a response body, then we know the middleware created a
        // response body and we can send the response
        if (response.body) {
          return response.sendStatic();
        }

        // Otherwise, throw a normal error. We don't really care about the error
        // type or error message because the catch block below will handle all
        // of that  -- returning a 404 Not Found error.
        throw new Error();
      }

      // If pretty links are enabled (that is, the code above was not executed),
      // then see if we can read an index.html based on the requested URL. For
      // example, if the request URL is /hello, then we will check to see if
      // /hello/index.html exists by trying to read /hello/index.html.
      response.headers.set("Content-Type", "text/html");
      const path = `${this.configs.directory}${request.url}`;
      let contents = await Deno.readFile(
        `${path}/index.html`,
      );
      // If an index.html file does not exist, then maybe the client is trying
      // to request a different HTML file, so let's try reading the requested
      // URL instead.
      if (!contents) {
        contents = await Deno.readFile(path);
      }
      response.body = contents;

      await this.executeMiddlewareAfterRequest(request, response);

      return response.sendStatic();
    } catch (error) {
      return await this.handleHttpRequestError(
        request,
        new Drash.Exceptions.HttpException(error.code ?? 404, error.message),
      );
    }
  }

  /**
   * Handle HTTP requests for virtual path assets.
   *
   * @param request - The request object.
   *
   * @returns The response as stringified JSON. This is only used for unit
   * testing purposes.
   */
  public async handleHttpRequestForVirtualPathAsset(
    request: Drash.Http.Request,
  ): Promise<Drash.Interfaces.ResponseOutput> {
    const response = this.buildResponse(request);

    try {
      response.headers.set(
        "Content-Type",
        this.services.http_service.getMimeType(request.url, true) ||
          "text/plain",
      );

      const virtualPath = request.url.split("/")[1];
      const physicalPath = this.virtual_paths.get("/" + virtualPath);
      const fullPath = `${await Deno.realPath(".")}/${physicalPath}${
        request.url.replace("/" + virtualPath, "")
      }`;

      response.body = await Deno.readFile(fullPath);

      await this.executeMiddlewareAfterRequest(request, response);

      return response.sendStatic();
    } catch (error) {
      return await this.handleHttpRequestError(
        request,
        new Drash.Exceptions.HttpException(error.code ?? 404, error.message),
      );
    }
  }

  /**
   * Run the Deno server at the hostname specified in the configs. This method
   * takes each HTTP request and creates a new and more workable request object
   * and passes it to `.handleHttpRequest()`.
   *
   * @param options - The HTTPOptions interface from https://deno.land/std/http/server.ts.
   *
   * @returns A Promise of the Deno server from the serve() call.
   */
  public async run(options: HTTPOptions): Promise<DenoServer> {
    if (!options.hostname) {
      options.hostname = this.hostname;
    }

    if (!options.port) {
      options.port = this.port;
    }

    this.hostname = options.hostname;
    this.port = options.port;
    this.deno_server = serve(options);

    await this.listen();
    return this.deno_server;
  }

  /**
   * Run the Deno server at the hostname specified in the configs as an HTTPS
   * Server. This method takes each HTTP request and creates a new and more
   * workable request object and passes it to `.handleHttpRequest()`.
   *
   * @param options - The HTTPSOptions interface from https://deno.land/std/http/server.ts.
   *
   * @returns A Promise of the Deno server from the serve() call.
   */
  public async runTLS(options: HTTPSOptions): Promise<DenoServer> {
    if (!options.hostname) {
      options.hostname = this.hostname;
    }

    if (!options.port) {
      options.port = this.port;
    }

    this.hostname = options.hostname;
    this.port = options.port;
    this.deno_server = serveTLS(options);

    await this.listen();
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
   * Add the middleware passed in via configs.
   */
  protected async addMiddleware(): Promise<void> {
    if (!this.configs.middleware) {
      return;
    }

    const middlewares = this.configs.middleware;

    // Add server-level middleware that executes before requests
    if (middlewares.before_request != null) {
      this.middleware.before_request = [];
      for (const middleware of middlewares.before_request) {
        this.middleware.before_request.push(middleware);
      }
    }

    // Add server-level middleware that executes after requests
    if (middlewares.after_request != null) {
      this.middleware.after_request = [];
      for (const middleware of middlewares.after_request) {
        this.middleware.after_request.push(middleware);
      }
    }

    // Add server-level middleware that executes after the resource is found
    if (middlewares.after_resource != null) {
      this.middleware.after_resource = [];
      for (const middleware of middlewares.after_resource) {
        this.middleware.after_resource.push(middleware);
      }
    }

    // Add compile time level middleware that executes right now--processing
    // data to be used later during runtime
    if (middlewares.compile_time) {
      for (const middleware of middlewares.compile_time) {
        await middleware.compile();
        this.middleware.runtime!.set(
          this.middleware.runtime!.size,
          middleware.run,
        );
      }
    }
  }

  /**
   * Add an HTTP resource to the server which can be retrieved at specific
   * URIs.
   *
   * Drash defines an HTTP resource according to the MDN Web docs
   * [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web).
   *
   * @param resourceClass - A child object of the `Drash.Http.Resource` class.
   */
  protected addResource(resourceClass: Drash.Interfaces.Resource): void {
    // Define the variable that will hold the data to helping us match path
    // params on the request during runtime
    const resourceParsedPaths = [];

    for (let path of resourceClass.paths) {
      // Strip out the trailing slash from paths
      if (path.charAt(path.length - 1) == "/") {
        path = path.substring(-1, path.length - 1);
      }

      // Path isn't a string? Don't even add it...
      if (typeof path != "string") {
        throw new Drash.Exceptions.InvalidPathException(
          `Path '${path as unknown as string}' needs to be a string.`,
        );
      }

      let paths: Drash.Interfaces.ResourcePaths;

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

      // Include the regex path in the index, so we can search for the regex
      // path during runtime in `.buildResource()`
      this.services.resource_index_service.addItem(
        [paths.regex_path],
        resourceClass,
      );
    }

    // Make sure we set the parsed paths so we can use it during runtime to
    // match request path params
    resourceClass.paths_parsed = resourceParsedPaths;
  }

  /**
   * Add the resources passed in via configs.
   */
  protected addResources(): void {
    if (!this.configs.resources) {
      return;
    }

    this.configs.resources.forEach(
      (resourceClass: Drash.Interfaces.Resource) => {
        this.addResource(resourceClass);
      },
    );
  }

  /**
   * Add a static path for serving static assets like CSS files, JS files,
   * PDF files, etc.
   *
   * @param path - The path where the static assets are located.
   * @param virtualPath - Is this a virtual path?
   */
  protected addStaticPath(
    path: string,
    virtualPath?: string,
  ): void {
    if (virtualPath) {
      this.virtual_paths.set(virtualPath, path);
      return;
    }

    (this.static_paths as string[]).push(path);
  }

  /**
   * Add static paths passed in via configs.
   */
  protected addStaticPaths(): void {
    const paths = this.configs.static_paths;

    if (paths) {
      if (!this.configs.directory) {
        throw new Drash.Exceptions.ConfigsException(
          `Static paths are being used, but a directory config was not specified`,
        );
      }
    }

    // Assume everything in the array is a string
    if (Array.isArray(paths)) {
      paths.forEach((path: string) => {
        if (typeof path != "string") {
          throw new Drash.Exceptions.ConfigsException(
            `Static path must be a string`,
          );
        }
        this.addStaticPath(path);
      });
      return;
    }

    // Assume the key is the virtual path and the value is the physical path
    for (const virtualPath in paths) {
      if (typeof virtualPath != "string") {
        throw new Drash.Exceptions.ConfigsException(
          `Virtual path must be a string`,
        );
      }

      const physicalPath = paths[virtualPath];
      if (typeof physicalPath != "string") {
        throw new Drash.Exceptions.ConfigsException(
          `Virtual path must be a string`,
        );
      }

      this.addStaticPath(physicalPath, virtualPath);
    }
  }

  /**
   * Build the configs for this server -- making sure to set any necessary
   * defaults.
   *
   * @param configs - The configs passed in by the user.
   *
   * @return The configs.
   */
  protected buildConfigs(
    configs: Drash.Interfaces.ServerConfigs,
  ): Drash.Interfaces.ServerConfigs {
    if (!configs.memory_allocation) {
      configs.memory_allocation = {};
    }

    return configs;
  }

  /**
   * Get the request object with more properties and methods.
   *
   * @param request - The request object.
   *
   * @returns Returns a Drash request object--hydrated with more properties and
   * methods than the ServerRequest object. These properties and methods are
   * used throughout the Drash request-resource-response lifecycle.
   */
  protected async buildRequest(
    serverRequest: ServerRequest,
  ): Promise<Drash.Http.Request> {
    const options: IRequestOptions = {
      memory_allocation: {
        multipart_form_data: 10,
      },
    };

    // Check if memory allocation has been specified in the configs. If so, use
    // it. We don't want to limit the user to 10MB of memory if they specify a
    // different value.
    const config = this.configs.memory_allocation;
    if (config && config.multipart_form_data) {
      options.memory_allocation.multipart_form_data =
        config.multipart_form_data;
    }

    // We have to build the request and then parse it's body after because
    // constructors cannot be async
    const request = new Drash.Http.Request(serverRequest, options);
    await request.parseBody();

    return request;
  }

  /**
   * Get the resource class.
   *
   * @param request - The request object.
   *
   * @returns A `Drash.Http.Resource` object if the URL path of the request can
   * be matched to a `Drash.Http.Resource` object's paths. Otherwise, it returns
   * `undefined` if a `Drash.Http.Resource` object can't be matched.
   */
  protected buildResource(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
  ): Drash.Http.Resource {
    let resourceClass = this.findResource(request);

    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    // (crookse)
    //
    // We ignore this because `resourceClass` could be `undefined`. `undefined`
    // doesn't have a construct signature and the compiler will complain about
    //
    // We ignore this because `resourceClass` could be `undefined`. `undefined`
    // doesn't have a construct signature and the compiler will complain about
    // it with the following error:
    //
    // TS2351: Cannot use 'new' with an expression whose type lacks a call or
    // construct signature.
    //
    const resource = new (resourceClass as Drash.Http.Resource)(
      request,
      response,
      this,
      resourceClass.paths,
      resourceClass.middleware,
    );

    return resource;
  }

  /**
   * Get a response object.
   *
   * @param request - The request object.
   *
   * @returns A response object.
   */
  protected buildResponse(request: Drash.Http.Request): Drash.Http.Response {
    return new Drash.Http.Response(request, {
      default_content_type: this.configs.response_output,
    });
  }

  /**
   * Execute server-level middleware after the request.
   *
   * @param request - The request object.
   * @param resource - The resource object.
   */
  protected async executeMiddlewareAfterRequest(
    request: Drash.Http.Request,
    response: Drash.Http.Response | null = null,
  ): Promise<void> {
    if (this.middleware.runtime) {
      if (response) {
        await this.executeMiddlewareRuntime(
          request,
          response,
        );
      }
    }

    if (this.middleware.after_request != null) {
      for (const middleware of this.middleware.after_request) {
        await middleware(request, response!);
      }
    }
  }

  /**
   * Execute server-level middleware after a resource has been found, but before
   * the resource's HTTP request method is executed.
   *
   * @param request - The request object.
   * @param resource - The resource object.
   */
  protected async executeMiddlewareAfterResource(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
  ): Promise<void> {
    if (this.middleware.after_resource != null) {
      for (const middleware of this.middleware.after_resource) {
        await middleware(request, response);
      }
    }
  }

  /**
   * Execute server-level middleware before the request.
   *
   * @param request - The request object.
   * @param resource - The resource object.
   */
  protected async executeMiddlewareBeforeRequest(
    request: Drash.Http.Request,
  ): Promise<void> {
    if (this.middleware.before_request != null) {
      for (const middleware of this.middleware.before_request) {
        await middleware(request);
      }
    }
  }

  /**
   * Execute server level runtime middleware after requests. Runtime middleware
   * requires compile time data from compile time middleware.
   *
   * @param request - The request objecft.
   * @param response - The response object.
   */
  protected executeMiddlewareRuntime(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
  ): void {
    let processed: boolean = false;

    this.middleware.runtime!.forEach(
      async (
        run: (
          request: Drash.Http.Request,
          response: Drash.Http.Response,
        ) => Promise<void>,
      ) => {
        if (!processed) {
          await run(request, response);
          processed = true;
        }
      },
    );
  }

  /**
   * The the resource that will handled the specified request based on the
   * request's URI.
   *
   * @param request - The request object.
   *
   * @return The resource as a constructor function to be used in
   * `.buildResource()`.
   */
  protected findResource(
    request: Drash.Http.Request,
  ): Drash.Interfaces.Resource {
    let resource: Drash.Interfaces.Resource | undefined = undefined;

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

    let results = this.services.resource_index_service.search(uriWithoutParams);

    // If no results are found, then check if /:some_param is in the index
    // service's lookup table because there might be a resource with
    // /:some_param as a URI
    if (results.size === 0) {
      results = this.services.resource_index_service.search("^/");
      // Still no resource found? GTFO.
      if (!results) {
        throw new Drash.Exceptions.HttpException(404);
      }
    }

    // Find the matching resource by comparing the request URL to a regex
    // pattern associated with a resource
    let matchedResource = false;
    results.forEach((result: ISearchResult) => {
      //result = (result as ISearchResult);
      // If we already matched a resource, then there is no need to parse any
      // further
      if (matchedResource) {
        return;
      }

      // Take the current result and see if it matches against the request URL
      const matchArray = request.url_path.match(
        result.search_term,
      );

      // If the request URL and result matched, then we know this result that we
      // are currently parsing contains the resource we are looking for
      if (matchArray) {
        matchedResource = true;
        resource = result.item as Drash.Interfaces.Resource;
        request.path_params = this.getRequestPathParams(
          resource,
          matchArray,
        );
      }
    });

    if (!resource) {
      throw new Drash.Exceptions.HttpException(404);
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
    resource: Drash.Interfaces.Resource | undefined,
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
        (pathObj: Drash.Interfaces.ResourcePaths) => {
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
  ): Drash.Interfaces.ResourcePaths {
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
  ): Drash.Interfaces.ResourcePaths {
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
  protected getResourcePathsUsingWildcard(
    path: string,
  ): Drash.Interfaces.ResourcePaths {
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
   * Used to check if a response object is of type Drash.Interfaces.ResponseOutput
   * or Drash.Http.Response.
   *
   * @return If the response returned from a method is what the returned value should be
   */
  protected isValidResponse(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
    resource: Drash.Http.Resource,
  ): boolean {
    // Method to aid inn checking is ann interface (Drash.Interface.ResponseOutput)
    function responseIsOfTypeResponseOutput(response: any): boolean {
      if (
        (typeof response === "object") &&
        (Array.isArray(response) === false) &&
        (response !== null)
      ) {
        return "status" in response &&
          "headers" in response &&
          "body" in response &&
          "send" in response &&
          "status_code" in response;
      }

      return false;
    }

    const valid = response instanceof Drash.Http.Response ||
      responseIsOfTypeResponseOutput(response) === true;

    if (!valid) {
      throw new Drash.Exceptions.HttpResponseException(
        418,
        `The response must be returned inside the ${request.method.toUpperCase()} method of the ${resource.constructor.name} class.`,
      );
    }

    return true;
  }

  /**
   * Listens for incoming HTTP connections on the server property
   */
  protected async listen() {
    (async () => {
      for await (const request of this.deno_server!) {
        try {
          this.handleHttpRequest(request as ServerRequest);
        } catch (error) {
          this.handleHttpRequestError(
            request as Drash.Http.Request,
            new Drash.Exceptions.HttpException(500),
          );
        }
      }
    })();
  }

  /**
   * Log a message. This only works if the server has a logger and it is set to
   * log "debug" level messages.
   *
   * @param message - Message to log
   */
  protected log(message: string): void {
    if (!this.configs.logger) {
      return;
    }

    this.configs.logger.debug("[syslog] " + message);
  }

  /**
   * Is the request targeting a static path?
   *
   * @param request - The request object
   *
   * @returns Either true or false. If the request targets a static path then it
   * returns true. Otherwise it returns false.
   */
  protected requestTargetsStaticPath(request: Drash.Http.Request): boolean {
    if (this.static_paths.length <= 0) {
      return false;
    }

    // If the request URL is "/public/assets/js/bundle.js", then we take out
    // "/public" and use that to check against the static paths
    const staticPath = request.url.split("/")[1];

    // Prefix with a leading slash, so it can be matched properly
    const requestUrl = `/${staticPath}`;

    if ((this.static_paths as string[]).indexOf(requestUrl) == -1) {
      return false;
    }

    return true;
  }

  /**
   * Is the request targeting a virtual path?
   *
   * @param request - The request object.
   *
   * @returns True if yes; false if no or if there are not any virtual paths
   * defined.
   */
  protected requestTargetsVirtualPath(serverRequest: ServerRequest): boolean {
    if (this.virtual_paths.size <= 0) {
      return false;
    }

    // If the request URL is "/public/assets/js/bundle.js", then we take out
    // "/public" and use that to check against the virtual paths
    const virtualPath = serverRequest.url.split("/")[1];

    // Prefix with a leading slash, so it can be matched properly
    const requestUrl = `/${virtualPath}`;

    if (!this.virtual_paths.has(requestUrl)) {
      return false;
    }

    return true;
  }
}
