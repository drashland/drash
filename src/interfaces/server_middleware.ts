import { Drash } from "../../mod.ts";

/**
 * @memberof Drash.Interfaces
 * @interface ServerMiddleware
 *
 * @description
 *     before_request: Array<Function>
 *
 *         An array of functions that take a Drash.Http.Request as a parameter.
 *         Method can be async.
 *
 *     after_request: Array<Function>
 *
 *         An array of functions that take in a Drash.Http.Request as the first
 *         parameter, and a Drash.Http.Response as the second parameter.
 *         Method can be async.
 *
 * @example
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
 */
export interface ServerMiddleware {
  before_request?: Array<
    | ((request: Drash.Http.Request) => Promise<void>)
    | ((request: Drash.Http.Request) => void)
  >;
  after_request?: Array<
    | ((
      request: Drash.Http.Request,
      response: Drash.Http.Response,
    ) => Promise<void>)
    | ((request: Drash.Http.Request, response: Drash.Http.Response) => void)
  >;
}
