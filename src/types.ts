import * as Drash from "../mod.ts";

/**
 * @description
 *     before_request?: MiddlewareFunction[]
 *
 *         An array that contains all the functions that will be run before a Drash.Http.Request is handled.
 *
 *     after_request: MiddlewareFunction[]
 *
 *         An array that contains all the functions that will be run after a Drash.Http.Request is handled.
 *
 */
export type Middleware = {
  before_request?: typeof Drash.Service[];
  after_request?: typeof Drash.Service[];
};

export type THttpMethod =
  | "CONNECT"
  | "DELETE"
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT"
  | "TRACE";

export type TConstructor<T extends unknown> = new (...args: unknown[]) => T;

export type TResponseBody =
  | unknown
  | string
  | Uint8Array
  | Deno.Reader
  | undefined;

/**
 * This is used to type a Request object's parsed body. Below are more details
 * on the members in this interface.
 *
 * content_type: string
 *
 *     The Content-Type of the request body. For example, if the body is
 *     JSON, then the Content-Type should be application/json.
 *
 * data: undefined|MultipartFormData|IKeyValuePairs
 *
 *     The data passed in the body of the request.
 */
export type TRequestBody =
  | Drash.Deps.MultipartFormData
  | Drash.Interfaces.IKeyValuePairs<unknown>
  | undefined;
