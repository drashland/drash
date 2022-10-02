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

import { DrashRequest, ResponseBuilder } from "../interfaces.ts";
import { StatusCode } from "../enums.ts";
import * as Interfaces from "../interfaces.ts";
import * as Types from "../types.ts";

/**
 * This is the base resource class for all resources. All resource classes MUST
 * extend this base resource class to inherit functionality that Drash expects
 * and uses.
 *
 * Drash defines a resource according to the MDN (see links below).
 *
 * All extended classes will have initial HTTP methods that return a 501 Not
 * Implemented response. This is based on the RFC (see attached links).
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web - MDN definition of resource.
 * @link https://datatracker.ietf.org/doc/html/rfc7231#section-4.1 - RFC section for using 501 Not Implemented as default HTTP method response.
 */
export class Resource<RequestType> implements Interfaces.Resource<RequestType> {
  public paths: string[] = [];
  public services:
    & Partial<Record<Types.HTTPMethod, Interfaces.Service<RequestType>[]>>
    & Partial<{
      ALL: Interfaces.Service<RequestType>[];
    }> = {};

  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////

  public CONNECT(
    _request: DrashRequest,
    response: ResponseBuilder,
  ): Types.Promisable<ResponseBuilder> {
    return response.error(StatusCode.NotImplemented);
  }

  public DELETE(
    _request: DrashRequest,
    response: ResponseBuilder,
  ): Types.Promisable<ResponseBuilder> {
    return response.error(StatusCode.NotImplemented);
  }

  public GET(
    _request: DrashRequest,
    response: ResponseBuilder,
  ): Types.Promisable<ResponseBuilder> {
    return response.error(StatusCode.NotImplemented);
  }

  public HEAD(
    _request: DrashRequest,
    response: ResponseBuilder,
  ): Types.Promisable<ResponseBuilder> {
    return response.error(StatusCode.NotImplemented);
  }

  public OPTIONS(
    _request: DrashRequest,
    response: ResponseBuilder,
  ): Types.Promisable<ResponseBuilder> {
    return response.error(StatusCode.NotImplemented);
  }

  public PATCH(
    _request: DrashRequest,
    response: ResponseBuilder,
  ): Types.Promisable<ResponseBuilder> {
    return response.error(StatusCode.NotImplemented);
  }

  public POST(
    _request: DrashRequest,
    response: ResponseBuilder,
  ): Types.Promisable<ResponseBuilder> {
    return response.error(StatusCode.NotImplemented);
  }

  public PUT(
    _request: DrashRequest,
    response: ResponseBuilder,
  ): Types.Promisable<ResponseBuilder> {
    return response.error(StatusCode.NotImplemented);
  }

  public TRACE(
    _request: DrashRequest,
    response: ResponseBuilder,
  ): Types.Promisable<ResponseBuilder> {
    return response.error(StatusCode.NotImplemented);
  }
}
