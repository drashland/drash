"use strict";
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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) ||
  function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) {
      throw new TypeError("Private accessor was defined without a setter");
    }
    if (
      typeof state === "function"
        ? receiver !== state || !f
        : !state.has(receiver)
    ) {
      throw new TypeError(
        "Cannot write private member to an object whose class did not declare it",
      );
    }
    return (kind === "a"
      ? f.call(receiver, value)
      : f
      ? f.value = value
      : state.set(receiver, value)),
      value;
  };
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) ||
  function (receiver, state, kind, f) {
    if (kind === "a" && !f) {
      throw new TypeError("Private accessor was defined without a getter");
    }
    if (
      typeof state === "function"
        ? receiver !== state || !f
        : !state.has(receiver)
    ) {
      throw new TypeError(
        "Cannot read private member from an object whose class did not declare it",
      );
    }
    return kind === "m"
      ? f
      : kind === "a"
      ? f.call(receiver)
      : f
      ? f.value
      : state.get(receiver);
  };
var _Request_instances,
  _Request_original,
  _Request_cookies,
  _Request_end_lifecycle,
  _Request_path_params,
  _Request_query_params,
  _Request_setCookies;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
/**
 * Drash's version of a `Request`. This class introduces helper methods to
 * interact with the native `Request` object (e.g., `request.readBody("json"))`.
 */
class Request {
  /**
   * @param originalRequest - An original, native `Request` object. This should
   * come from the runtime.
   */
  constructor(originalRequest) {
    _Request_instances.add(this);
    _Request_original.set(this, void 0);
    _Request_cookies.set(this, void 0);
    _Request_end_lifecycle.set(this, false);
    _Request_path_params.set(this, void 0);
    _Request_query_params.set(this, void 0);
    __classPrivateFieldSet(this, _Request_original, originalRequest, "f");
    // @ts-ignore: TODO(crookse) Make Node request interface
    // this.#original.headers.append("x-drash-version", "v3");
  }
  get url() {
    // @ts-ignore
    return __classPrivateFieldGet(this, _Request_original, "f").url;
  }
  get headers() {
    // @ts-ignore
    return __classPrivateFieldGet(this, _Request_original, "f").headers;
  }
  // FILE MARKER - METHODS - PUBLIC (EXPOSED) //////////////////////////////////
  accepts(contentType) {
    return true;
    // const acceptHeader = this.headers.get("Accept");
    // if (!acceptHeader) {
    //   return false;
    // }
    // return acceptHeader.includes(contentType);
  }
  cookie(cookie) {
    if (!__classPrivateFieldGet(this, _Request_cookies, "f")) {
      __classPrivateFieldSet(
        this,
        _Request_cookies,
        __classPrivateFieldGet(
          this,
          _Request_instances,
          "m",
          _Request_setCookies,
        ).call(this),
        "f",
      );
    }
    return __classPrivateFieldGet(this, _Request_cookies, "f")[cookie];
  }
  end() {
    __classPrivateFieldSet(this, _Request_end_lifecycle, true, "f");
  }
  header(header) {
    return header;
    // return this.headers.get(header);
  }
  // public pathParam(param: string): string | undefined {
  //   if (!this.#path_params) {
  //     this.#path_params = this.setPathParams();
  //   }
  //   return this.#path_params[param];
  // }
  // public queryParam(param: string): string | null {
  //   if (!this.#query_params) {
  //     this.#query_params = this.#setQueryParams();
  //   }
  //   return this.#query_params.get(param);
  // }
  // public readBody<T>(method: Types.RequestMethods): Types.Promisable<T> {
  //   return this[method as Types.MethodOf<Request>]() as Types.Promisable<T>;
  // }
  // FILE MARKER - GETTERS / SETTERS ///////////////////////////////////////////
  get end_early() {
    return __classPrivateFieldGet(this, _Request_end_lifecycle, "f");
  }
  // abstract setPathParams(): Record<string, string | undefined>;
  setResourceHandler(resourceHandler) {
    this.resource_handler = resourceHandler;
  }
}
exports.Request = Request;
_Request_original = new WeakMap(),
  _Request_cookies = new WeakMap(),
  _Request_end_lifecycle = new WeakMap(),
  _Request_path_params = new WeakMap(),
  _Request_query_params = new WeakMap(),
  _Request_instances = new WeakSet(),
  _Request_setCookies = function _Request_setCookies() {
    // const cookie = this.headers.get("Cookie") ?? "";
    // const cookiesArray = cookie.split(";");
    const ret = {};
    // for (const keyValueStore of cookiesArray) {
    //   const [cookieKey, ...cookieVal] = keyValueStore.split("=");
    //   const key = cookieKey.trim();
    //   ret[key] = cookieVal.join("=");
    // }
    return ret;
  };
//# sourceMappingURL=request.js.map
