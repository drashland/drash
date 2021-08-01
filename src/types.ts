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

/**
 * The allowed types for an HTTP method on a resource.
 */
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

/**
 * A type to help pass in constructable classes to other functions which
 * construct those classes.
 */
export type TConstructor<T extends unknown> = new (...args: unknown[]) => T;

/**
 * The types that the response body can be.
 */
export type TResponseBody =
  | Deno.Reader
  | Uint8Array
  | string
  | undefined;

/**
 * The types that the request body can be.
 */
export type TRequestBody =
  | Drash.Deps.MultipartFormData
  | Drash.Interfaces.IKeyValuePairs<unknown>
  | undefined;
