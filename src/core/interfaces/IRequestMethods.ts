/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023  Drash authors. The Drash authors are listed in the
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
 * A base interface for classes that implement HTTP methods. For example,
 * resource classes use this interface.
 */
export interface IRequestMethods {
  /**
   * The CONNECT HTTP method which is called if the request to the resource is a
   * CONNECT request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/CONNECT
   *
   * @param input The input to help produce an output.
   * @returns An output based on the input.
   */
  CONNECT(input: unknown): unknown;

  /**
   * The DELETE HTTP method which is called if the request to the resource is a
   * DELETE request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE
   *
   * @param input The input to help produce an output.
   * @returns An output based on the input.
   */
  DELETE(input: unknown): unknown;

  /**
   * The GET HTTP method which is called if the request to the resource is a
   * GET request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/GET
   *
   * @param input The input to help produce an output.
   * @returns An output based on the input.
   */
  GET(input: unknown): unknown;

  /**
   * The OPTIONS HTTP method which is called if the request to the resource is a
   * OPTIONS request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS
   *
   * @param input The input to help produce an output.
   * @returns An output based on the input.
   */
  HEAD(input: unknown): unknown;

  /**
   * The OPTIONS HTTP method which is called if the request to the resource is a
   * OPTIONS request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS
   *
   * @param input The input to help produce an output.
   * @returns An output based on the input.
   */
  OPTIONS(input: unknown): unknown;

  /**
   * The PATCH HTTP method which is called if the request to the resource is a
   * PATCH request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PATCH
   *
   * @param input The input to help produce an output.
   * @returns An output based on the input.
   */
  PATCH(input: unknown): unknown;

  /**
   * The POST HTTP method which is called if the request to the resource is a
   * POST request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST
   *
   * @param input The input to help produce an output.
   * @returns An output based on the input.
   */
  POST(input: unknown): unknown;

  /**
   * The PUT HTTP method which is called if the request to the resource is a
   * PUT request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/PUT
   *
   * @param input The input to help produce an output.
   * @returns An output based on the input.
   */
  PUT(input: unknown): unknown;

  /**
   * The TRACE HTTP method which is called if the request to the resource is a
   * TRACE request. See the following for more information on this method.
   *
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/TRACE
   *
   * @param input The input to help produce an output.
   * @returns An output based on the input.
   */
  TRACE(input: unknown): unknown;
}
