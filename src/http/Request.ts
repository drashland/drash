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
  ServerRequest,
  getCookies,
  MultipartReader,
  FormFile,
} from "../../deps.ts";

import { HttpError } from "../domain/errors/HttpError.ts";

/**
 * The Request class for incoming request object from the client
 *
 * @class
 * @since 2.0.0
 */
export class Request extends ServerRequest {
  private parsedBody = new Map<string, string | FormFile | FormFile[]>();
  private _query = new Map<string, string>();
  private _baseuri = "";
  private _cookies = new Map<string, string>();

  /**
   * @returns {Map<string, string>} A map that contains the query
   * @since 2.0.0
   */
  public get query(): Map<string, string> {
    if (this._query.size !== 0) {
      // We already defined it for this request (cached)
      return this._query;
    }

    const query = this.url.split("?")[1];
    if (!query) {
      // There is no query
      return this._query;
    }

    this._query = this.convertQueryToMap(query);
    return this._query;
  }

  /**
   * @returns {Map<string, string>} A map that contains all the cookies
   * @since 2.0.0
   */
  public get cookies(): Map<string, string> {
    if (this._cookies.size !== 0) {
      // We already defined it for this request (cached)
      return this._cookies;
    }
    const cookiesObject = getCookies(this);
    for (const key in cookiesObject) {
      if (Object.prototype.hasOwnProperty.call(cookiesObject, key)) {
        this._cookies.set(key, cookiesObject[key]);
      }
    }
    return this._cookies;
  }

  /**
   * @returns {string} A string that contains the baseuri (without query)
   * @since 2.0.0
   */
  public get baseuri(): string {
    if (this._baseuri.length !== 0) {
      // We already defined it for this request (cached)
      return this._baseuri;
    }
    if (this.url === "/") {
      this._baseuri = this.url;
      return this._baseuri;
    }
    this._baseuri = this.url.split("?")[0];
    return this._baseuri;
  }

  /**
   * Use this method to retrieve the parsed body. The first call of this method will cache the parsed body for subsequent calls
   *
   *     const parsedBody1 = await request.getParsedBody();  // Not cached
   *     const parsedBody2 = await request.getParsedBody();  // Cached
   *
   * @param {object} [options] - The possible options to be used in the parser
   * @param {number} [options.maxUploadSize] - The maximum upload size of the form, in MB
   * @returns {Promise<Map<string, string | FormFile | FormFile[]>>}
   * @since 2.0.0
   */
  public async getParsedBody(options?: {
    maxUploadSize?: number;
  }): Promise<Map<string, string | FormFile | FormFile[]>> {
    if (this.parsedBody.size !== 0) {
      // We already defined it for this request (cached)
      return this.parsedBody;
    }

    // We define a default value
    const contentType =
      this.headers.get("Content-Type") ||
      this.headers.get("content-type") ||
      "application/x-www-form-urlencoded";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      this.parsedBody = await this.parseBodyAsFormUrlEncoded(this.body);
      return this.parsedBody;
    }

    if (contentType.includes("application/json")) {
      this.parsedBody = await this.parseBodyAsJson(this.body);
      return this.parsedBody;
    }

    if (contentType.includes("multipart/form-data")) {
      this.parsedBody = await this.parseBodyAsMultipartFormData(
        this.body,
        contentType,
        options?.maxUploadSize
      );
      return this.parsedBody;
    }

    return this.parsedBody;
  }

  private async parseBodyAsJson(body: Deno.Reader) {
    const parsedBody = new TextDecoder().decode(await Deno.readAll(body));
    return JSON.parse(parsedBody);
  }

  private async parseBodyAsFormUrlEncoded(body: Deno.Reader) {
    const parsedBody = new TextDecoder().decode(await Deno.readAll(body));

    const query = parsedBody.split("?")[1];
    if (!query) {
      // There is no query
      return this.parsedBody;
    }

    const map = this.convertQueryToMap(query);
    return map;
  }

  private async parseBodyAsMultipartFormData(
    body: Deno.Reader,
    contentType: string,
    maxUploadSize?: number
  ) {
    const match = contentType.match(/boundary=([^\s]+)/i);
    if (!match) {
      throw new HttpError(415, "No boundary set");
    }

    const boundary = match[1];
    if (boundary === "") {
      throw new HttpError(415, "No boundary set");
    }

    // Convert from MB to B
    if (maxUploadSize) {
      maxUploadSize *= 1024 ** 2;
    }
    const formData = await new MultipartReader(body, boundary).readForm(
      maxUploadSize
    );
    const map = new Map<string, string | FormFile | FormFile[]>();
    for (const [key, value] of formData.entries()) {
      if (!key) {
        continue;
      }
      if (!value) {
        continue;
      }
      map.set(key, value);
    }
    return map;
  }

  private convertQueryToMap(query: string) {
    const map = new Map<string, string>();
    const params = query.split("&");
    for (const param of params) {
      const [key, value] = param.split("=");
      if (!key) {
        continue;
      }
      if (!value) {
        continue;
      }
      map.set(key, value);
    }
    return map;
  }
}
