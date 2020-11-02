import type { Drash } from "../../mod.ts";

/**
 * Contains the type of ServerMiddleware.
 *
 * @remarks
 * before_request
 *
 *     An array of functions that take a Drash.Http.Request as a parameter.
 *     Method can be async.
 *
 * after_request
 *
 *     An array of functions that take in a Drash.Http.Request as the first
 *     parameter, and a Drash.Http.Response as the second parameter.
 *     Method can be async.
 *
 * ```ts
 * function beforeRequestMiddleware (request: Drash.Http.Request): void {
 *   ...
 * }
 * async function afterRequestMiddleware (
 *   request: Drash.Http.Request,
 *   response: Drash.Http.Response
 * ): Promise<void> {
 *   ...
 * }
 * const server = new Drash.Http.Server({
 *   middleware: {
 *     before_request: [beforeRequestMiddleware],
 *     afterRequest: [afterRequestMiddleware]
 *   }
 * }
 * ```
 */
export interface ServerMiddleware {
  // Middleware to execute during compile time. The data that's compiled during
  // compile time will be able to be used during runtime.
  compile_time?: Array<
    {
      // The compile time method to run during compile time
      compile: () => Promise<void>;
      // The runtime method to run during runtime
      run: ((
        request: Drash.Http.Request,
        response: Drash.Http.Response,
      ) => Promise<void>);
    }
  >;

  // Middleware to execute during runtime based on compiled data from compile
  // time level middleware
  runtime?: Map<
    number,
    ((
      request: Drash.Http.Request,
      response: Drash.Http.Response,
    ) => Promise<void>)
  >;

  // Middleware executed before a request is made. That is, before a resource's
  // HTTP method is called.
  before_request?: Array<
    | ((request: Drash.Http.Request) => Promise<void>)
    | ((request: Drash.Http.Request) => void)
  >;

  // Middleware executed after requests, but before responses are sent
  after_request?: Array<
    | ((
      request: Drash.Http.Request,
      response: Drash.Http.Response,
    ) => Promise<void>)
    | ((request: Drash.Http.Request, response: Drash.Http.Response) => void)
  >;
  after_resource?: Array<
    | ((
      request: Drash.Http.Request,
      response: Drash.Http.Response,
    ) => Promise<void>)
    | ((request: Drash.Http.Request, response: Drash.Http.Response) => void)
  >;
}
