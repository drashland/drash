import { Drash } from "../../mod.ts";
import {
  HTTPOptions,
  HTTPSOptions,
  Response,
  serve,
  Server as DenoServer,
  ServerRequest,
  serveTLS,
  Status,
  STATUS_TEXT,
} from "../../deps.ts";
import type { ServerMiddleware } from "../interfaces/server_middleware.ts";

interface IRequestOptions {
  default_response_content_type: string | undefined;
  headers?: Headers;
  memory_allocation: {
    multipart_form_data: number;
  };
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
  protected trackers = {
    requested_favicon: false,
  };

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
   * A property to hold this server's logger.
   */
  public logger: Drash.CoreLoggers.ConsoleLogger | Drash.CoreLoggers.FileLogger;

  /**
   * A property to hold this server's configs.
   */
  protected configs: Drash.Interfaces.ServerConfigs;

  protected preprocessors: Array<any> = [];

  /**
   * A property to hold the location of this server on the filesystem. This
   * property is used when resolving static paths.
   */
  protected directory: string | undefined = undefined;

  /**
   * A property to hold middleware.
   */
  protected middleware: ServerMiddleware = {};

  /**
   * A property to hold the resources passed in from the configs.
   */
  protected resources: { [key: string]: Drash.Interfaces.Resource } = {};

  /**
   * This server's list of static paths. HTTP requests to a static path are
   * usually intended to retrieve some type of concrete resource (e.g., a
   * CSS file or a JS file). If an HTTP request is matched to a static path
   * and the resource the HTTP request is trying to get is found, then
   * Drash.Http.Response will use its sendStatic() method to send the
   * static asset back to the client.
   */
  protected static_paths: string[] = [];

  protected p_client_side_typescript: any = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////


  protected async executeClientSideTypeScriptBundling(preprocessor: any, data: any) {
    const p = new preprocessor(data.files);
    const d = await p.run();
    this.p_client_side_typescript = d;
  }

  /**
   * Construct an object of this class.
   *
   * @param configs - The config of Drash Server
   */
  constructor(configs: Drash.Interfaces.ServerConfigs) {
    if (configs.preprocessors) {
      configs.preprocessors.forEach(async (preprocessorObj: any) => {
        if (preprocessorObj.preprocessor.name == "ClientSideTypeScript") {
          await this.executeClientSideTypeScriptBundling(
            preprocessorObj.preprocessor,
            preprocessorObj.data
          );
        }
      });
    }


    if (!configs.logger) {
      this.logger = new Drash.CoreLoggers.ConsoleLogger({
        enabled: false,
      });
    } else {
      this.logger = configs.logger;
    }

    this.configs = configs;

    if (configs.middleware) {
      this.addMiddleware(configs.middleware);
    }

    if (configs.resources) {
      configs.resources.forEach((resourceClass: Drash.Interfaces.Resource) => {
        this.addHttpResource(resourceClass);
      });
      delete this.configs.resources;
    }

    if (!configs.memory_allocation) {
      configs.memory_allocation = {};
    }

    if (configs.static_paths) {
      this.directory = configs.directory; // blow up if this doesn't exist
      configs.static_paths.forEach((path: string) => {
        this.addStaticPath(path);
      });
    }

    if (configs.template_engine && !configs.views_path) {
      throw new Error(
        "Property missing. The views_path must be defined if template_engine is true",
      );
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Get the request object with more properties and methods.
   *
   * @param request - The request object.
   *
   * @returns Returns a Drash request object--hydrated with more properties and
   * methods than the ServerRequest object. These properties and methods are
   * used throughout the Drash request-resource-response lifecycle.
   */
  public async getRequest(
    serverRequest: ServerRequest,
  ): Promise<Drash.Http.Request> {
    let options: IRequestOptions = {
      default_response_content_type: this.configs.response_output,
      memory_allocation: {
        multipart_form_data: 10,
      },
    };
    const config = this.configs.memory_allocation;
    if (config && config.multipart_form_data) {
      options.memory_allocation.multipart_form_data =
        config.multipart_form_data;
    }
    const request = new Drash.Http.Request(serverRequest, options);
    await request.parseBody();
    return request;
  }

  /**
   * Handle an HTTP request from the Deno server.
   *
   * @param request - The request object.
   *
   * @returns A Promise of ResponseOutput.
   */
  public async handleHttpRequest(
    serverRequest: Drash.Http.Request,
  ): Promise<Drash.Interfaces.ResponseOutput> {
    // Handle a request to a static path
    if (this.requestTargetsStaticPath(serverRequest)) {
      return await this.handleHttpRequestForStaticPathAsset(serverRequest);
    }

    // Handle a request to the favicon
    if (serverRequest.url == "/favicon.ico") {
      return this.handleHttpRequestForFavicon(serverRequest);
    }

    let response;
    let resource;
    let request;

    try {
      request = await this.getRequest(serverRequest);
    } catch (error) {
      return await this.handleHttpRequestError(
        serverRequest as Drash.Http.Request,
        this.httpErrorResponse(400, error.message),
      );
    }

    try {
      this.logger.info(
        `Request received: ${request.method.toUpperCase()} ${request.url}`,
      );

      let resourceClass = this.getResourceClass(request);

      await this.executeMiddlewareServerLevelBeforeRequest(request);

      // No resource? Send a 404 (Not Found) response.
      if (!resourceClass) {
        return await this.handleHttpRequestError(
          request,
          this.httpErrorResponse(404),
        );
      }

      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      // (crookse)
      //
      // We ignore this because `resourceClass` could be `undefined`. `undefined`
      // doesn't have a construct signature and the compiler will complain about
      // it with the following error:
      //
      // TS2351: Cannot use 'new' with an expression whose type lacks a call or
      // construct signature.
      //
      resource = new (resourceClass as Drash.Http.Resource)(
        request,
        new Drash.Http.Response(request, {
          views_path: this.configs.views_path,
          template_engine: this.configs.template_engine,
          default_response_content_type: this.configs.response_output,
        }),
        this,
      );
      // We have to add the static properties back because they get blown away
      // when the resource object is created
      resource.paths = resourceClass.paths;
      resource.middleware = resourceClass.middleware;

      request.resource = resource;
      this.logDebug(
        "Using `" +
          resource.constructor.name +
          "` resource class to handle the request.",
      );

      // Perform the request
      this.logDebug("Calling " + request.method.toUpperCase() + "().");
      if (typeof resource[request.method.toUpperCase()] !== "function") {
        throw new Drash.Exceptions.HttpException(405);
      }
      response = await resource[request.method.toUpperCase()]();

      await this.executeMiddlewareServerLevelAfterRequest(request, response);

      // Send the response
      this.logDebug("Sending response. " + response.status_code + ".");
      return response.send();
    } catch (error) {
      this.logDebug(error.stack);
      return await this.handleHttpRequestError(
        request,
        error,
        resource,
        response,
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
    this.logDebug(
      `Error occurred while handling request: ${request.method} ${request.url}`,
    );
    this.logDebug(error.message);
    if (error.stack) {
      this.logDebug("Stack trace below:");
      this.logDebug(error.stack);
    }

    this.logDebug("Generating generic error response object.");

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

    response = new Drash.Http.Response(request, {
      views_path: this.configs.views_path,
      template_engine: this.configs.template_engine,
      default_response_content_type: this.configs.response_output,
    });
    response.status_code = error.code ? error.code : 500;
    response.body = error.message ? error.message : response.getStatusMessage();

    this.logDebug(
      `Sending response. Content-Type: ${
        response.headers.get(
          "Content-Type",
        )
      }. Status: ${response.getStatusMessageFull()}.`,
    );

    try {
      await this.executeMiddlewareServerLevelAfterRequest(request, response);
    } catch (error) {
      // Do nothing. The `executeMiddlewareServerLevelAfterRequest()` method is
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
  public handleHttpRequestForFavicon(
    request: Drash.Http.Request,
  ): Drash.Interfaces.ResponseOutput {
    const headers = new Headers();
    headers.set("Content-Type", "image/x-icon");

    const response = new Drash.Http.Response(request);
    response.status_code = 200;
    response.headers = headers;

    try {
      const body = Deno.readFileSync(`${Deno.realPathSync(".")}/favicon.ico`);
      response.body = body;
      if (!this.trackers.requested_favicon) {
        this.trackers.requested_favicon = true;
        this.logDebug("/favicon.ico requested.");
        if (!body) {
          this.logDebug("/favicon.ico was not found.");
        } else {
          this.logDebug("/favicon.ico was found.");
        }
        this.logDebug(
          "All future log messages for /favicon.ico will be muted.",
        );
      }
    } catch (error) {
      response.body = "";
    }

    let output: Drash.Interfaces.ResponseOutput = {
      body: response.body as string,
      headers: headers,
      status: response.status_code,
    };

    request.respond(output);
    output.status_code = response.status_code;
    return output;
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
    try {
      await this.executeMiddlewareServerLevelBeforeRequest(request);

      const response = new Drash.Http.Response(request, {
        views_path: this.configs.views_path,
        template_engine: this.configs.template_engine,
      });

      // Set the response's Content-Type type header based on the request's URL.
      // For example, if the request's URL is /public/style.css, then the
      // Content-Type header should be set to text/css.
      const mimeType = new Drash.Services.HttpService().getMimeType(
        request.url,
        true,
      );
      if (mimeType) {
        response.headers.set("Content-Type", mimeType);
      }
      if (request.url.includes(".ts")) {
        response.body = this.p_client_side_typescript.output;
        response.headers.set("Content-Type", "text/javascript");
        return response.sendStatic();
      }

      // Two things are happening here:
      // 1. If pretty_links is not enabled, then serve what was requested; or
      // 2. If the request.url has an extension (e.g., .js), then serve the
      // requested asset. Since this occurs after the MIME code above, the
      // client should receive a proper response in the proper format.
      if (!this.configs.pretty_links || request.url.split(".")[1]) {
        response.body = Deno.readFileSync(`${this.directory}/${request.url}`);
        await this.executeMiddlewareServerLevelAfterRequest(request, response);
        return response.sendStatic();
      }

      // If pretty links are enabled (that is, the code above was not executed),
      // then see if we can read an index.html based on the requested URL. For
      // example, if the request URL is /hello, then we will check to see if
      // /hello/index.html exists by trying to read /hello/index.html.
      response.headers.set("Content-Type", "text/html");
      const path = `${this.directory}${request.url}`;
      let contents = Deno.readFileSync(
        `${path}/index.html`,
      );
      // If an index.html file does not exist, then maybe the client is trying
      // to request a different HTML file, so let's try reading the requested
      // URL instead.
      if (!contents) {
        contents = Deno.readFileSync(path);
      }
      response.body = contents;
      await this.executeMiddlewareServerLevelAfterRequest(request, response);
      return response.sendStatic();
    } catch (error) {
      return await this.handleHttpRequestError(
        request,
        this.httpErrorResponse(error.code ?? 404, error.message),
      );
    }
  }

  /**
   * Run the Deno server at the hostname specified in the configs. This
   * method takes each HTTP request and creates a new and more workable
   * request object and passes it to
   * `Drash.Http.Server.handleHttpRequest()`.
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
    (async () => {
      for await (const request of this.deno_server!) {
        try {
          this.handleHttpRequest(request as Drash.Http.Request);
        } catch (error) {
          this.handleHttpRequestError(
            request as Drash.Http.Request,
            this.httpErrorResponse(500),
          );
        }
      }
    })();
    return this.deno_server;
  }

  /**
   * Run the Deno server at the hostname specified in the configs as an
   * HTTPS Server. This method takes each HTTP request and creates a new and
   * more workable request object and passes it to
   * `Drash.Http.Server.handleHttpRequest()`.
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
    (async () => {
      for await (const request of this.deno_server!) {
        try {
          this.handleHttpRequest(request as Drash.Http.Request);
        } catch (error) {
          this.handleHttpRequestError(
            request as Drash.Http.Request,
            this.httpErrorResponse(500),
          );
        }
      }
    })();
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
   * Add an HTTP resource to the server which can be retrieved at specific
   * URIs.
   *
   * Drash defines an HTTP resource according to the MDN Web docs
   * [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web).
   *
   * @param resourceClass - A child object of the `Drash.Http.Resource` class.
   */
  protected addHttpResource(resourceClass: Drash.Interfaces.Resource): void {
    const newPaths = [];
    for (const path of resourceClass.paths) {
      if (typeof path != "string") {
        newPaths.push(path);
        continue;
      }

      if (path.includes("*") == true) {
        // Wildcard
        const pathObj = {
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

        newPaths.push(pathObj);
      } else if (path.includes("?") === true) { // optional params
        let tmpPath = path;
        // Replace required params, in preparation to create the `regex_path`, just like
        // how we do in the below else block
        const numberOfRequiredParams = path.split("/").filter((param) => {
          // Ignores optional (`?`) params and only pulls how many required parameters
          // the resource path contains, eg:
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
        // Description for the below for loop and why we use it to create the regex for
        // optional parameters:
        // For each optional parameter in the path, we replace it with custom regex.
        // Similar to how other blocks construct the `regex_path`, but in this case,
        // it isn't as easy as a simple `replace` one-liner, due to needing to account for
        // optional parameters (:name?), and required parameters before optional params.
        // This is what we do to construct the `regex_path`. I haven't been able to
        // come up with a regex that would replace all instances and work, which is
        // why a loop is being used here, to replace the first instance of an optional
        // parameter (to account for a possible required parameter before), and then
        // replace the rest of the occurrences. It's slightly tricky because the path
        // `/users/:name?/:age?/:city?` should match  `/users`.
        for (let i = 0; i < maxOptionalParams; i++) {
          if (i === 0) { // We need to mark the start for the first optional param
            // The below regex is very similar to `REGEX_URI_MATCHES` but this regex isn't
            // global, and accounts for there being a required parameter before
            tmpPath = tmpPath.replace(
              /\/(:[^(/]+|{[^0-9][^}]*}\?)\/?/,
              "/?([a-zA-Z0-9]+)?/?", // A `/` being optional, as well as the param being optional, and a ending `/` being optional
            );
          } else { // We can now create the replace regex for the rest taking into consideration the above replace regex
            tmpPath = tmpPath.replace(
              /\/?(:[^(/]+|{[^0-9][^}]*}\?)\/?/,
              "([^/]+)?/?",
            );
          }
        }
        const pathObj = {
          og_path: path,
          regex_path: `^${tmpPath}$`,
          // Regex is same as other blocks, but we also strip the `?`.
          params: (path.match(Server.REGEX_URI_MATCHES) || []).map(
            (element: string) => {
              return element.replace(/:|{|}|\?/g, "");
            },
          ),
        };
        newPaths.push(pathObj);
      } else {
        const pathObj = {
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
        newPaths.push(pathObj);
      }
    }

    resourceClass.paths_parsed = newPaths;

    // Store the resource so it can be retrieved when requested
    this.resources[resourceClass.name] = resourceClass;
  }

  /**
   * Add server-level and resource-level middleware.
   *
   * @param middleware - The middlewares to be added to the server
   */
  protected addMiddleware(middlewares: ServerMiddleware): void {
    // Add server-level middleware
    if (middlewares.before_request != null) {
      this.middleware.before_request = [];
      for (const middleware of middlewares.before_request) {
        this.middleware.before_request.push(middleware);
      }
    }
    if (middlewares.after_request != null) {
      this.middleware.after_request = [];
      for (const middleware of middlewares.after_request) {
        this.middleware.after_request.push(middleware);
      }
    }
  }

  /**
   * Add a static path for serving static assets like CSS files, JS files,
   * PDF files, etc.
   *
   * @param path - The path where the static assets are
   */
  protected addStaticPath(path: string): void {
    this.static_paths.push(path);
  }

  /**
   * Execute server-level middleware before the request.
   *
   * @param request - The request object.
   * @param resource - The resource object.
   */
  protected async executeMiddlewareServerLevelBeforeRequest(
    request: Drash.Http.Request,
  ): Promise<void> {
    // Execute server-level middleware
    if (this.middleware.before_request != null) {
      for (const middleware of this.middleware.before_request) {
        await middleware(request);
      }
    }
  }

  /**
   * Execute server-level middleware after the request.
   *
   * @param request - The request object.
   * @param resource - The resource object.
   */
  protected async executeMiddlewareServerLevelAfterRequest(
    request: Drash.Http.Request,
    response: Drash.Http.Response | null,
  ): Promise<void> {
    if (this.middleware.after_request != null) {
      for (const middleware of this.middleware.after_request) {
        await middleware(request, response!);
      }
    }
  }

  /**
   * Get an HTTP error response exception object.
   *
   * @param code - The code that should be used
   * @param message - The message it should be displayed
   *
   * @returns A new http exception.
   */
  protected httpErrorResponse(
    code: number,
    message?: string,
  ): Drash.Exceptions.HttpException {
    return new Drash.Exceptions.HttpException(code, message);
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
  protected getResourceClass(
    request: Drash.Http.Request,
  ): Drash.Interfaces.Resource | undefined {
    for (const resourceName in this.resources) {
      const resource = this.resources[resourceName];
      const pathObjs = resource.paths_parsed!;
      for (const pathObj of pathObjs) {
        if (pathObj.og_path === "/" && request.url_path === "/") {
          return resource;
        }

        const pathMatchesRequestPathname = request.url_path.match(
          pathObj.regex_path,
        );
        if (pathMatchesRequestPathname == null) {
          continue;
        }

        pathMatchesRequestPathname.shift();
        const pathParamsInKvpForm: { [key: string]: string } = {};
        pathObj.params.forEach((paramName: string, index: number) => {
          pathParamsInKvpForm[paramName] = pathMatchesRequestPathname[index];
        });

        request.path_params = pathParamsInKvpForm;
        return resource;
      }
    }
    return undefined;
  }

  /**
   * Is the request targeting a static path?
   *
   * @param request - The request object
   *
   * @returns Either true or false. If the request targets a static path then it
   * returns true. Otherwise it returns false.
   */
  protected requestTargetsStaticPath(serverRequest: ServerRequest): boolean {
    if (this.static_paths.length <= 0) {
      return false;
    }
    // If the request URL is "/public/assets/js/bundle.js", then we take out
    // "/public" and use that to check against the static paths
    const staticPath = serverRequest.url.split("/")[1];
    // Prefix with a leading slash, so it can be matched properly
    const requestUrl = `/${staticPath}`;

    if (this.static_paths.indexOf(requestUrl) == -1) {
      return false;
    }

    return true;
  }

  /**
   * Log a debug message
   *
   * @param message - Message to log
   */
  protected logDebug(message: string): void {
    this.logger.debug("[syslog] " + message);
  }
}
