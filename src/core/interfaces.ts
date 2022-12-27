/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
 * Copyright (C) 2022  Drash authors. The Drash authors are listed in the
 * AUTHORS file at <https://github.com/drashland/drash/AUTHORS>. This notice
 * applies to Drash version 3.X.X and any later version.
 *
 * This file is part of Drash. See <https://github.com/drashland/drash>.
 *
 * Drash is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * Drash is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Drash. If not, see <https://www.gnu.org/licenses/>.
 */

import * as Types from "./Types.ts";

/**
 * Representation of a request in Drash, which is a wrapper around the native
 * `Request`. It has all the same methods as the native `Request` and additional
 * methods that can be used in Drash's context. For example, you can get a path
 * param from a Drash request.
 */
export interface DrashRequest extends Request {
  /**
   * Check if the content type in question are accepted by the request.
   *
   * @param contentType - A proper MIME type.
   * that Drash can handle.
   *
   * @returns True if yes, false if no.
   */
  accepts(contentType: string): boolean;

  /**
   * Stop this request from being processed further in the
   * request-resource-response- lifecycle.
   */
  end(): void;

  /**
   * Get a path param's value by the given name.
   *
   * @param name The name of the path param to get.
   *
   * @returns The query param value or `undefined` if it does not exist.
   */
  pathParam(name: string): string | undefined;

  /**
   * Get a query param's value by the given name.
   *
   * @param name The name of the query param to get.
   *
   * @returns The query param value or `null` if it does not exist.
   */
  queryParam(name: string): string | null;

  /**
   * Get a cookie with the given name (if it exists).
   *
   * @param name - The name of the cookie.
   *
   * @returns The cookie value by the given name.
   */
  cookie(name: string): string;

  /**
   * Parse the body using one of the native `Request` methods (e.g.,
   * `arrayBuffer()`, `json()`, `formData()`, etc.). When calling this method,
   * you can provide the typed result of the parsed body. For example, if the
   * body is JSON and the schema is `{ hello: "world" }`, then you can call
   * this method like so:
   *
   * ```typescript
   * const body = request.parseBody<{ hello: string }>("json");
   * console.log(body.hello); // "world"
   * ```
   *
   * @param method - The native `Request` method to use to parse the body. For
   * example, to parse the body as JSON, then use `"json"` for this param.
   * @returns The typing (`<T>`) that is specified when calling this method.
   */
  readBody<BodySchema>(
    method: Types.RequestMethods,
  ): Types.Promisable<BodySchema>;
}

/**
 * Drash's `Response` builder which allows building response objects by method
 * chaining.
 *
 * Some examples of method chaining to build a response object are below. More
 * examples can be found at [https://drash.land/drash](https://drash.land/drash).
 *
 * ```ts
 * response.error(400, "Womp womp. Validation failed.");
 * // Creates the following response (shortened for brevity):
 * //
 * // < HTTP 400
 * // < Content-Type: text/plain
 * // <
 * // Womp womp. Validation failed.
 *
 * response.json({ we: "are", json: "here"});
 * // Creates the following response (shortened for brevity):
 * //
 * // < HTTP 200
 * // < Content-Type: application/json
 * // <
 * // {
 * //   "we": "are",
 * //   "json": "here"
 * // }
 *
 * response.status(200).body("Hello, world!");
 * // Creates the following response (shortened for brevity):
 * //
 * // < HTTP 200
 * // < Content-Type: text/plain
 * // <
 * // Hello, world!
 *
 * response.text("Ok this is a 404 text/plain response.");
 * // Creates the following response (shortened for brevity):
 * //
 * // < HTTP 404
 * // < Content-Type: text/plain
 * // <
 * // Ok this is a 404 text/plain response.
 * ```
 */
export interface ResponseBuilder {
  state: Partial<Types.ResponseBuilderState>;

  /**
   * Set the body of this response.
   *
   * @param body - The body of the response.
   * @returns `this` object for method chaining.
   *
   * @link The `body` param is used as the `body` argument in https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters
   */
  body<T extends BodyInit>(body: T | null): this;

  /**
   * Set the body of this response.
   *
   * @param contentType - The Content-Type of the body.
   * @param body - The body of the response.
   * @returns `this` object for method chaining.
   *
   * @link The `contentType` param is used in the `options.headers` argument in https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters
   * @link The `body` param is used as the `body` argument in https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters
   */
  body<T extends BodyInit>(
    contentType: string,
    body: T | null,
  ): this;

  /**
   * Throw an error with the given HTTP status code and reason?
   * @param statusCode - The status code to put in the response Status line.
   * @param reason - (optional) The reason this error is being thrown.
   */
  error(statusCode: Types.HTTPStatusCode, reason?: string): this;

  /**
   * Set one or many cookies on this response.
   *
   * @param cookies - A key-value object where the key is the cookie's name and
   * the value is the cookie's value.
   * @returns `this` object for method chaining.
   *
   * @link This follows https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
   *
   * @example
   * ```typescript
   * response.cookies({
   *   "some-cookie-name": "some cookie value"
   * })
   * ```
   */
  cookies(cookies: Record<string, Partial<Types.Cookie>>): this;

  /**
   * Delete one or many cookies.
   *
   * @param cookies - An array of cookie names to delete.
   * @returns `this` object for method chaining.
   *
   * @link This follows https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
   */
  deleteCookies(cookies: string[]): this;

  /**
   * Set one or many headers on this response. If two headers are the same, the
   * last one will take precedence.
   *
   * @param headers - A key-value object where the key is the header's name and
   * the value is the header's value.
   * @returns `this` object for method chaining.
   *
   * @example
   * ```typescript
   * response.headers({
   *   "x-some-cool-header-1": "some cool value 1",
   *   "x-some-cool-header-2": "some cool value 2",
   * });
   * ```
   *
   * @link This follows https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
   * @link The headers will be used in the `options.headers` argument in https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters
   */
  headers(headers: Record<string, string>): this;

  /**
   * Set this response with a Content-Type header of text/html and a body as an
   * HTML string.
   *
   * @param html - The XML to set as the body of this response.
   * @returns `this` object for method chaining.
   *
   * @link This is used as the `body` argument in https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters
   */
  html(html: string): this;
  /**
   * Set this response with a Content-Type header of application/json and a body
   * as a JSON string.
   *
   * @param json - The JSON object to set as the body of this response. The JSON
   * object will have `JSON.stringify()` called on it.
   * @returns `this` object for method chaining.
   *
   * @link This is used as the `body` argument in https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters
   */
  json<T extends Record<string, unknown> | unknown[]>(json: T): this;

  /**
   * Set the status code and text of this response.
   *
   * @param status - A valid HTTP status code.
   * @returns `this` object for method chaining.
   *
   * @link This is used as the `options.status` argument in https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters
   */
  status(
    status: number | Types.HTTPStatusCode,
  ): this;

  /**
   * Set this response with a Content-Type header of text/plain and a body as a
   * string.
   * @param text - The text to set as the body of this response.
   * @returns `this` object for method chaining.
   *
   * @link This is used as the `body` argument in https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters
   */
  text(text: string): this;

  /**
   * Set this response with a Content-Type header of text/xml and a body as an
   * XML string.
   * @param xml - The XML to set as the body of this response.
   * @returns `this` object for method chaining.
   *
   * @link This is used as the `body` argument in https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters
   */
  xml(xml: string): this;
  /**
   * Set this response to redirect.
   *
   * @param statusCode - A valid redirection status code.
   * @returns `this` object for method chaining.
   *
   * @link This follows https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections
   */
  redirect(location: string): this;

  /**
   * Set this response as a file.
   *
   * @returns `this` object for method chaining.
   *
   * @link This is used as the `body` argument in https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters
   */
  // file(): this;

  /**
   * Set this response as a downloadable item.
   *
   * @returns `this` object for methond chaining.
   *
   * @link This is used as the `body` argument in https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#parameters
   */
  // download(): this;
}

export interface RequestHandler {
  /**
   * Handle the given args to produce or transform the context.
   * @param args The args that this handler handles to produce the returned
   * context.
   */
  handle(
    context: Types.ContextForRequest,
  ): Types.Promisable<Types.ContextForRequest>;

  /**
   * Set the next handler of this handler. When this handler is put in the chain
   * of responsibility (COR) pattern, the COR pattern will call
   * `handler.next_handler.handle()`.
   * @param handler The next handler to set. This next handler is called when
   * this handler is put into a chain.
   */
  setNextHandler(handler: RequestHandler): RequestHandler;
}

export interface Service {
  /**
   * Method that runs before a resource's HTTP method is called.
   * @param request - The incoming request.
   * @param response - The response to be sent to the client.
   */
  runBeforeResource?: (
    request: DrashRequest,
  ) => Types.Promisable<Response | void>;

  /**
   * Method that runs after a resource's HTTP method is called.
   * @param request - The incoming request.
   * @param response - The response to be sent to the client.
   */
  runAfterResource?: (
    request: DrashRequest,
    response?: Types.Promisable<Response>,
  ) => Types.Promisable<Response | void>;

  /**
   * Method that runs during `Drash.RequestHandler` build time.
   * @param options - The startup options provided by `Drash.RequestHandler`.
   */
  runAtStartup?: (
    options: Types.ContextForServicesAtStartup,
  ) => Types.Promisable<Response | void>;

  /**
   * Method that runs AFTER the error handler handles a request that resulted in
   * Drash throwing an error during the request-resource-repsonse lifecycle.
   */
  runOnError?: (
    request: DrashRequest,
    response?: Response,
  ) => Types.Promisable<Response | void>;
}

export interface Resource {
  /**
   * The paths this resource is accessible at. For example, if the path is
   * `/home`, then requests to `/home` will target this resource.
   */
  paths: string[];

  /**
   * The CONNECT HTTP method which is called if the request to the resource is a
   * CONNECT request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/CONNECT
   */
  CONNECT(
    request: Request,
  ): Types.Promisable<Response>;

  /**
   * The DELETE HTTP method which is called if the request to the resource is a
   * DELETE request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE
   */
  DELETE(
    request: Request,
  ): Types.Promisable<Response>;

  /**
   * The GET HTTP method which is called if the request to the resource is a
   * GET request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
   */
  GET(
    request: Request,
  ): Types.Promisable<Response>;

  /**
   * The OPTIONS HTTP method which is called if the request to the resource is a
   * OPTIONS request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS
   */
  HEAD(
    request: Request,
  ): Types.Promisable<Response>;

  /**
   * The OPTIONS HTTP method which is called if the request to the resource is a
   * OPTIONS request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS
   */
  OPTIONS(
    request: Request,
  ): Types.Promisable<Response>;

  /**
   * The PATCH HTTP method which is called if the request to the resource is a
   * PATCH request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH
   */
  PATCH(
    request: Request,
  ): Types.Promisable<Response>;

  /**
   * The POST HTTP method which is called if the request to the resource is a
   * POST request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST
   */
  POST(
    request: Request,
  ): Types.Promisable<Response>;

  /**
   * The PUT HTTP method which is called if the request to the resource is a
   * PUT request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT
   */
  PUT(
    request: Request,
  ): Types.Promisable<Response>;

  /**
   * The TRACE HTTP method which is called if the request to the resource is a
   * TRACE request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/TRACE
   */
  TRACE(
    request: Request,
  ): Types.Promisable<Response>;
}
