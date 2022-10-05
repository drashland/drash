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
import * as Interfaces from "../../interfaces.js";
import * as Types from "../../types.js";
/**
 * Drash's version of a `Request`. This class introduces helper methods to
 * interact with the native `Request` object (e.g., `request.readBody("json"))`.
 */
export declare abstract class AbstractNativeRequest<ResourceHandler>
  extends Request
  implements Interfaces.NativeRequest {
  protected cookies?: Record<string, string>;
  protected end_lifecycle: boolean;
  protected path_params?: Record<string, string | undefined>;
  protected query_params?: URLSearchParams;
  protected resource_handler?: ResourceHandler;
  /**
   * @param originalRequest - An original, native `Request` object. This should
   * come from the runtime.
   */
  constructor(originalRequest: Request);
  accepts(contentType: string): boolean;
  cookie(cookie: string): string;
  end(): void;
  header(header: string): string | null;
  pathParam(param: string): string | undefined;
  queryParam(param: string): string | null;
  readBody<T>(method: Types.RequestMethods): Types.Promisable<T>;
  get end_early(): boolean;
  abstract setPathParams(): Record<string, string | undefined>;
  setResourceHandler(resourceHandler: ResourceHandler): void;
  /**
   * Set the cookies on this request.
   * @returns A key-value object where the key is the cookie name and the value
   * is the cookie value.
   */
  protected setCookies(): Record<string, string>;
  /**
   * Set the query params by delegating the extraction of the query params to
   * `URLSearchParams`.
   * @returns An instance of `URLSearchParams` that can be used to
   */
  protected setQueryParams(): URLSearchParams;
}
