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

import * as Interfaces from "./interfaces.ts";

export type HandleMethod<Arg, ReturnValue> = (
  arg: Arg,
) => ReturnValue;

export type CatchableReason = "request_end_early";

export type Catchable = Error;

export type Cookie = {
  /** Name of the cookie. */
  name: string;
  /** Value of the cookie. */
  value: string;
  /** Expiration date of the cookie. */
  expires?: Date;
  /** Max-Age of the Cookie. Max-Age must be an integer superior or equal to 0. */
  max_age?: number;
  /** Specifies those hosts to which the cookie will be sent. */
  domain?: string;
  /** Indicates a URL path that must exist in the request. */
  path?: string;
  /** Indicates if the cookie is made using SSL & HTTPS. */
  secure?: boolean;
  /** Indicates that cookie is not accessible via JavaScript. */
  http_only?: boolean;
  /**
   * Allows servers to assert that a cookie ought not to
   * be sent along with cross-site requests.
   */
  same_site?: "Strict" | "Lax" | "None";
  /** Additional key value pairs with the form "key=value" */
  unparsed?: string[];
};

export type ServiceMethod =
  | RuntimeServiceMethod
  | "runAtStartup";

export type RuntimeServiceMethod =
  | "runAfterResource"
  | "runBeforeResource"
  | "runOnError";

export type RunAtStartupService<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> = Required<
  Pick<
    Interfaces.Service<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >,
    "runAtStartup"
  >
>;

export type RunBeforeResourceService<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> = Required<
  Pick<
    Interfaces.Service<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >,
    "runBeforeResource"
  >
>;

export type RunAfterResourceService<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> = Required<
  Pick<
    Interfaces.Service<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >,
    "runAfterResource"
  >
>;

export type RunOnErrorService<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> = Required<
  Pick<
    Interfaces.Service<
      GenericRequest,
      GenericResponse,
      GenericResponseBody,
      GenericResponseBuilder
    >,
    "runOnError"
  >
>;

/**
 * Stand-in for https://github.com/microsoft/TypeScript/issues/31394.
 */
export type Promisable<T> = T | Promise<T>;

export type ErrorHandlerContext<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> = {
  /** The error that caused this error handler to be called. */
  error?: Error;
  /** The request associated with this error. */
  request: GenericRequest;
  /** The response associated with this error. */
  response: GenericResponseBuilder;
};

/**
 * The native `Request` class' methods for parsing a body.
 */
export type RequestMethods =
  | "arrayBuffer"
  | "blob"
  | "formData"
  | "json"
  | "text";

/**
 * Each incoming request gets its own context. The context is this typing and it
 * is passed around throughout the entire request-resource-response lifecycle.
 */
export type ContextForRequest<GenericRequest, GenericResponseBuilder> = {
  /**
   * The `Error` that is thrown during the lifecycle. This is optional because
   * an `Error` is only assigned to this property when an `Error` is thrown.
   */
  error?: Error;

  /**
   * The `NativeRequest` instance, not the interface.
   */
  request: GenericRequest;

  /**
   * The `ResourceHandler` instance. This is optional since there might not be a
   * resource yet. For example, when a request enters `Drash.RequsetHandler`,
   * the context is created with only the `NativeRequest` and `ResponseBuilder`
   * objects. There is no resource yet until later in the lifecycle.
   */
  resource_handler?: Interfaces.ResourceHandler<GenericResponseBuilder>;

  /**
   * The `ResponseBuilder` instance, not the interface.
   */
  response: GenericResponseBuilder;
};

/**
 * Request methods defined by HTTP.
 *
 * @link See https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods.
 */
export type HTTPMethod =
  | "CONNECT"
  | "DELETE"
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT"
  | "TRACE";

export type ResourcePaths = {
  regex_path: string;
  path_params: string[];
};

/**
 * Utility type that helps identify "this is a method of the given object"
 */
export type MethodOf<Object> = {
  // deno-lint-ignore no-explicit-any
  [K in keyof Object]: Object[K] extends (...args: any[]) => unknown ? K
    : never;
}[keyof Object];

export type HTTPStatusCode =
  | 100
  | 101
  | 102
  | 103
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 226
  | 300
  | 301
  | 302
  | 303
  | 304
  | 305
  | 307
  | 308
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418
  | 421
  | 422
  | 423
  | 424
  | 425
  | 426
  | 428
  | 429
  | 431
  | 451
  | 500
  | 501
  | 502
  | 503
  | 504
  | 505
  | 506
  | 507
  | 508
  | 510
  | 511;

/**
 * Typing for the values in the `Drash.Response.statuses` key-value store.
 */
export type HTTPStatusCodeRegistry = {
  /**
   * The HTTP status code description (e.g, `OK`).
   */
  description: string;

  // To be implemented. See https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
  // reference?: string[];

  /**
   * The HTTP status code (e.g., `200`).
   */
  value: HTTPStatusCode;
};

/**
 * An instance of the {@link Resource}.
 */
export type ResourceClass<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> = new (
  ...args: unknown[]
) => Interfaces.Resource<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder
>;

/**
 * An instance of the {@link Interfaces.Service}.
 */
export type ServiceClass<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> = new (
  ...args: unknown[]
) => Interfaces.Service<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder
>;

/**
 * An instance of {@link Interfaces.ErrorHandler}.
 */
export type ErrorHandlerClass<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> = new (
  ...args: unknown[]
) => Interfaces.ErrorHandler<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder
>;

/**
 * Options given to the `Drash.RequestHandler` class.
 */
export type RequestHandlerOptions<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> = {
  /**
   * The resources (which contain the URIs) to register with the handler. Any
   * resource or URI not added to the handler will result in a 404 when
   * requested by a client.
   */
  resources?: ResourceClass<
    GenericRequest,
    GenericResponse,
    GenericResponseBody,
    GenericResponseBuilder
  >[];
  /**
   * The error handler that handles any errors in the request handler's
   * lifecycle.
   */
  error_handler?: ErrorHandlerClass<
    GenericRequest,
    GenericResponse,
    GenericResponseBody,
    GenericResponseBuilder
  >;
  /**
   * The services to add to the request handler lifecycle. These services can
   * run at different points in the lifecycle.
   */
  services?: Interfaces.Service<
    GenericRequest,
    GenericResponse,
    GenericResponseBody,
    GenericResponseBuilder
  >[];
};

/**
 * Options given to the `Service.runAtStartup()` method.
 */
export type ContextForServicesAtStartup<
  GenericRequest,
  GenericResponse,
  GenericResponseBody,
  GenericResponseBuilder extends Interfaces.ResponseBuilder<
    GenericResponse,
    GenericResponseBody
  >,
> = {
  request_handler: Interfaces.RequestHandler<
    GenericRequest,
    GenericResponse,
    GenericResponseBody,
    GenericResponseBuilder
  >;
};
