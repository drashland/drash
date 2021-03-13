/*
 * MIT License
 *
 * Copyright (c) 2019-2021 Drash Land
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {
  ServerResponse,
  setCookie,
  getCookies,
  deleteCookie,
  Cookie,
} from "../../deps.ts";

/**
 * The Response class for outcoming response object to the client
 *
 * @class
 * @since 2.0.0
 */
export class Response implements ServerResponse {
  public status?: number;
  public headers?: Headers;
  public body?: Uint8Array | Deno.Reader | string;
  public trailers?: () => Promise<Headers> | Headers;
  private _cookies = new Map<string, string>();

  /**
   * @returns {Map<string, string>} A map that contains all the cookies
   * @since 2.0.0
   */
  public get cookies(): Map<string,string> {
    if (this._cookies.size !== 0) {
      // We already defined it for this request (cached)
      return this._cookies;
    }

    if (!this.headers) {
      this.headers = new Headers();
    }

    const cookiesObject = getCookies({
      headers: this.headers,
    });
    for (const key in cookiesObject) {
      if (Object.prototype.hasOwnProperty.call(cookiesObject, key)) {
        this._cookies.set(key, cookiesObject[key]);
      }
    }
    return this._cookies;
  }

  /**
   * Use this method to append a cookie to the response object
   *
   * @param {object} cookie - The cookie object to be added
   * @since 2.0.0
   */
  public setCookie(cookie: Cookie) {
    setCookie(this, cookie);
  }

  /**
   * Use this method to remove a cookie to the response object
   *
   * @param {string} cookie - The cookie name to be removed
   * @since 2.0.0
   */
  public deleteCookie(name: string) {
    deleteCookie(this, name);
  }
}
