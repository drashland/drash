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
/**
 * Drash's version of a `Request`. This class introduces helper methods to
 * interact with the native `Request` object (e.g., `request.readBody("json"))`.
 */
export class AbstractNativeRequest extends Request {
  /**
   * @param originalRequest - An original, native `Request` object. This should
   * come from the runtime.
   */
  constructor(originalRequest) {
    super(originalRequest);
    this.end_lifecycle = false;
    this.headers.append("x-drash-version", "v3");
  }
  // FILE MARKER - METHODS - PUBLIC (EXPOSED) //////////////////////////////////
  accepts(contentType) {
    const acceptHeader = this.headers.get("Accept");
    if (!acceptHeader) {
      return false;
    }
    return acceptHeader.includes(contentType);
  }
  cookie(cookie) {
    if (!this.cookies) {
      this.cookies = this.setCookies();
    }
    return this.cookies[cookie];
  }
  end() {
    this.end_lifecycle = true;
  }
  header(header) {
    return this.headers.get(header);
  }
  pathParam(param) {
    if (!this.path_params) {
      this.path_params = this.setPathParams();
    }
    return this.path_params[param];
  }
  queryParam(param) {
    if (!this.query_params) {
      this.query_params = this.setQueryParams();
    }
    return this.query_params.get(param);
  }
  readBody(method) {
    return this[method]();
  }
  // FILE MARKER - GETTERS / SETTERS ///////////////////////////////////////////
  get end_early() {
    return this.end_lifecycle;
  }
  setResourceHandler(resourceHandler) {
    this.resource_handler = resourceHandler;
  }
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  /**
   * Set the cookies on this request.
   * @returns A key-value object where the key is the cookie name and the value
   * is the cookie value.
   */
  setCookies() {
    var _a;
    const cookie = (_a = this.headers.get("Cookie")) !== null && _a !== void 0
      ? _a
      : "";
    const cookiesArray = cookie.split(";");
    const ret = {};
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
  setQueryParams() {
    // TODO(crookse) Make faster if possible
    return new URL(this.url).searchParams;
  }
}
//# sourceMappingURL=native_request.js.map
