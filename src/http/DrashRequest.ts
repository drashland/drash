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

import { getCookies } from "../../deps.ts";

/**
 *
 * The Request class for incoming request object from the client
 *
 * @since 3.0.0
 */
export class DrashRequest extends Request {
  #query = new URLSearchParams();
  #protocol = "";
  #hostname = "";
  #pathname = "";
  #baseUrl = "";
  #cookies = new Map<string, string>();

  /**
   * @returns {URLSearchParams} A map that contains the query
   * @since 3.0.0
   */
  public get query(): URLSearchParams {
    if (Array.from(this.#query).length !== 0) {
      // We already defined it for this request (cached)
      return this.#query;
    }

    const url = new URL(super.url);
    this.#query = url.searchParams;

    return this.#query;
  }

  /**
   * @returns {Map<string, string>} A map that contains all the cookies
   * @since 3.0.0
   */
  public get cookies(): Map<string, string> {
    if (this.#cookies.size !== 0) {
      // We already defined it for this request (cached)
      return this.#cookies;
    }
    const cookiesObject = getCookies(this);
    for (const key in cookiesObject) {
      if (Object.prototype.hasOwnProperty.call(cookiesObject, key) === false) {
        continue;
      }
      this.#cookies.set(key, cookiesObject[key]);
    }
    return this.#cookies;
  }

  /**
   * @returns {string} A string that contains the baseUrl (without query and path)
   * @since 3.0.0
   */
  public get baseUrl(): string {
    if (this.#baseUrl.length !== 0) {
      // We already defined it for this request (cached)
      return this.#baseUrl;
    }
    this.#baseUrl = `${this.protocol}://${this.hostname}`;
    return this.#baseUrl;
  }

  /**
   * @returns {string} A string that contains the protocol of the url
   * @since 3.0.0
   */
  public get protocol(): string {
    if (this.#hostname.length !== 0) {
      // We already defined it for this request (cached)
      return this.#protocol;
    }
    const url = new URL(super.url);
    this.#protocol = url.protocol.slice(0, -1);
    return this.#protocol;
  }

  /**
   * @returns {string} A string that contains the hostname of the url
   * @since 3.0.0
   */
  public get hostname(): string {
    if (this.#hostname.length !== 0) {
      // We already defined it for this request (cached)
      return this.#hostname;
    }
    const url = new URL(super.url);
    this.#hostname = url.hostname;
    return this.#hostname;
  }

  /**
   * @returns {string} A string that contains the pathname of the url
   * @since 3.0.0
   */
  public get pathname(): string {
    if (this.#pathname.length !== 0) {
      // We already defined it for this request (cached)
      return this.#hostname;
    }
    const url = new URL(super.url);
    this.#pathname = url.pathname;
    return this.#pathname;
  }
}
