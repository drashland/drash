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

import * as Interfaces from "../Interfaces.ts";
import * as Types from "../Types.ts";

export class DrashRequest extends Request implements Interfaces.DrashRequest {
  protected cookies?: Record<string, string>;
  protected end_lifecycle = false;
  protected path_params?: Record<string, string | undefined>;
  protected query_params?: URLSearchParams;
  protected resource_handler?: Interfaces.ResourceHandler;

  /**
   * @param originalRequest - An original, native `Request` object. This should
   * come from the runtime.
   */
  constructor(originalRequest: Request) {
    super(originalRequest);
    this.headers.append("x-drash-version", "v3");
  }

  /**
   * Set the path params on this request. This takes the request's URL and
   * matches it to the path params defined by the resource it targets.
   * @returns A key-value object where the key is the path param name and the
   * value is the path param value.
   */
  setPathParams(): Record<string, string | undefined> {
    const pathParams: Record<string, string | undefined> = {};

    if (!this.resource_handler) {
      return pathParams;
    }

    const urlPatterns = this.resource_handler
      .getOriginalUrlPatterns() as URLPattern[];

    if (urlPatterns.length <= 0) {
      return pathParams;
    }

    // for (const pattern of this.#resource_handler.url_patterns) {
    for (const pattern of urlPatterns) {
      const result = pattern.exec(this.url);

      if (result === null) {
        continue;
      }

      // This is the resource we need, and below are the path params that were
      // found in the request's URL
      const params: Record<string, string> = {};

      for (const key in result.pathname.groups) {
        params[key] = result.pathname.groups[key];
      }

      for (let [pathParam, value] of Object.entries(params)) {
        if (value) {
          value = value.trim();
        }

        pathParams[pathParam] = value === "" ? undefined : value;
      }
    }

    return pathParams;
  }

  // FILE MARKER - METHODS - PUBLIC (EXPOSED) //////////////////////////////////

  public accepts(contentType: string): boolean {
    const acceptHeader = this.headers.get("Accept");
    if (!acceptHeader) {
      return false;
    }

    return acceptHeader.includes(contentType);
  }

  public cookie(cookie: string): string {
    if (!this.cookies) {
      this.cookies = this.setCookies();
    }

    return this.cookies[cookie];
  }

  public end(): void {
    this.end_lifecycle = true;
  }

  public header(header: string): string | null {
    return this.headers.get(header);
  }

  public pathParam(param: string): string | undefined {
    if (!this.path_params) {
      this.path_params = this.setPathParams();
    }

    return this.path_params[param];
  }

  public queryParam(param: string): string | null {
    if (!this.query_params) {
      this.query_params = this.setQueryParams();
    }
    return this.query_params.get(param);
  }

  public readBody<T>(method: Types.RequestMethods): Types.Promisable<T> {
    return this[method as Types.MethodOf<Request>]() as Types.Promisable<T>;
  }

  // FILE MARKER - GETTERS / SETTERS ///////////////////////////////////////////

  get end_early() {
    return this.end_lifecycle;
  }

  abstract setPathParams(): Record<string, string | undefined>;

  public setResourceHandler(
    resourceHandler: Interfaces.ResourceHandler,
  ) {
    this.resource_handler = resourceHandler;
  }

  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////

  /**
   * Set the cookies on this request.
   * @returns A key-value object where the key is the cookie name and the value
   * is the cookie value.
   */
  protected setCookies(): Record<string, string> {
    const cookie = this.headers.get("Cookie") ?? "";
    const cookiesArray = cookie.split(";");

    const ret: Record<string, string> = {};

    for (const keyValueStore of cookiesArray) {
      const [cookieKey, ...cookieVal] = keyValueStore.split("=");
      const key = cookieKey.trim();

      ret[key] = cookieVal.join("=");
    }

    return ret;
  }

  /**
   * Set the query params by delegating the extraction of the query params to
   * `URLSearchParams`.
   * @returns An instance of `URLSearchParams` that can be used to
   */
  protected setQueryParams(): URLSearchParams {
    // TODO(crookse) Make faster if possible
    return new URL(this.url).searchParams;
  }
}
