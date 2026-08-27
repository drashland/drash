/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
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

/**
 * The base class every resource extends. A resource maps a set of paths to the
 * HTTP methods that answer them.
 *
 * @module
 */

import { HTTPError } from "../errors/HTTPError.ts";
import { Status } from "./response/Status.ts";

/**
 * The base resource class for all resources.
 */
class Resource {
  /**
   * The paths this resource answers. Matched with `URLPattern` syntax, so they
   * may carry params (`/users/:id`), optional params (`/users/:id?`), and regular
   * expressions.
   */
  public paths: string[] = [];

  /**
   * Handle a `CONNECT` request.
   *
   * Override this to answer the method; leaving it alone means a request using
   * it gets `501 Not Implemented`.
   *
   * @param _request The request, in whatever shape the runtime provides.
   * @returns Whatever your runtime needs as a response.
   * @throws {HTTPError} `501 Not Implemented` unless overridden.
   */
  public CONNECT(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  /**
   * Handle a `DELETE` request.
   *
   * Override this to answer the method; leaving it alone means a request using
   * it gets `501 Not Implemented`.
   *
   * @param _request The request, in whatever shape the runtime provides.
   * @returns Whatever your runtime needs as a response.
   * @throws {HTTPError} `501 Not Implemented` unless overridden.
   */
  public DELETE(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  /**
   * Handle a `GET` request.
   *
   * Override this to answer the method; leaving it alone means a request using
   * it gets `501 Not Implemented`.
   *
   * @param _request The request, in whatever shape the runtime provides.
   * @returns Whatever your runtime needs as a response.
   * @throws {HTTPError} `501 Not Implemented` unless overridden.
   */
  public GET(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  /**
   * Handle a `HEAD` request.
   *
   * Override this to answer the method; leaving it alone means a request using
   * it gets `501 Not Implemented`.
   *
   * @param _request The request, in whatever shape the runtime provides.
   * @returns Whatever your runtime needs as a response.
   * @throws {HTTPError} `501 Not Implemented` unless overridden.
   */
  public HEAD(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  /**
   * Handle a `OPTIONS` request.
   *
   * Override this to answer the method; leaving it alone means a request using
   * it gets `501 Not Implemented`.
   *
   * @param _request The request, in whatever shape the runtime provides.
   * @returns Whatever your runtime needs as a response.
   * @throws {HTTPError} `501 Not Implemented` unless overridden.
   */
  public OPTIONS(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  /**
   * Handle a `PATCH` request.
   *
   * Override this to answer the method; leaving it alone means a request using
   * it gets `501 Not Implemented`.
   *
   * @param _request The request, in whatever shape the runtime provides.
   * @returns Whatever your runtime needs as a response.
   * @throws {HTTPError} `501 Not Implemented` unless overridden.
   */
  public PATCH(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  /**
   * Handle a `POST` request.
   *
   * Override this to answer the method; leaving it alone means a request using
   * it gets `501 Not Implemented`.
   *
   * @param _request The request, in whatever shape the runtime provides.
   * @returns Whatever your runtime needs as a response.
   * @throws {HTTPError} `501 Not Implemented` unless overridden.
   */
  public POST(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  /**
   * Handle a `PUT` request.
   *
   * Override this to answer the method; leaving it alone means a request using
   * it gets `501 Not Implemented`.
   *
   * @param _request The request, in whatever shape the runtime provides.
   * @returns Whatever your runtime needs as a response.
   * @throws {HTTPError} `501 Not Implemented` unless overridden.
   */
  public PUT(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }

  /**
   * Handle a `TRACE` request.
   *
   * Override this to answer the method; leaving it alone means a request using
   * it gets `501 Not Implemented`.
   *
   * @param _request The request, in whatever shape the runtime provides.
   * @returns Whatever your runtime needs as a response.
   * @throws {HTTPError} `501 Not Implemented` unless overridden.
   */
  public TRACE(_request: unknown): unknown {
    throw new HTTPError(Status.NotImplemented);
  }
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { Resource };
