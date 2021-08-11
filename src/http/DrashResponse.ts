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
  Cookie,
  deleteCookie,
  setCookie,
  STATUS_TEXT,
} from "../../deps.ts";

/**
 *
 * The DrashResponse class for the response object to be used.
 * @since 3.0.0
 */
export class DrashResponse {
  #body: BodyInit = "";
  #headers = new Headers();
  #status = 200;
  #statusText: string = STATUS_TEXT.get(this.#status)!;

  /**
   * @returns The response body
   * @since 3.0.0
   */
  public get body(): BodyInit {
    return this.#body;
  }

  public set body(body: BodyInit) {
    this.#body = body;
  }

  /**
   * @property The response headers
   * @since 3.0.0
   */
  public get headers(): Headers {
    return this.#headers;
  }

  /**
   * @property The response status
   * @since 3.0.0
   */
  public get status(): number {
    return this.#status;
  }

  public set status(status: number) {
    const text = STATUS_TEXT.get(status);
    if (text != null) {
      this.#status = status;
      this.#statusText = text;
    }
  }

  /**
   * @property The statusText associated with the current status
   * @since 3.0.0
   */
  public get statusText(): string {
    return this.#statusText;
  }

  /**
   *
   * Use this method to append a cookie to the response object.
   *
   * @param cookie - The cookie object to be added
   * @since 3.0.0
   */
  public setCookie(cookie: Cookie) {
    setCookie(this, cookie);
  }

  /**
   *
   * Use this method to remove a cookie to the response object.
   *
   * @param cookie - The cookie to be removed
   * @since 3.0.0
   */
  public deleteCookie(cookie: string) {
    deleteCookie(this, cookie);
  }

  /**
   *
   * Use this method to append a header to the header object.
   *
   * @param key - The key to be added
   * @param value - The value to be added
   * @since 3.0.0
   */
  public setHeader(key: string, value: string) {
    this.#headers.append(key, value);
  }

  /**
   *
   * Use this method to delete a header from the header object.
   *
   * @param key - The key that is present in the header object
   * @since 3.0.0
   */
  public deleteHeader(key: string) {
    this.#headers.delete(key);
  }

  /**
   *
   * Use this function to render a HTML using a template engine. Keep in mind
   * this be the last thing you do because it sets the body and content-type.
   *
   * @param render - The render function from your template engine
   * @param ...args - The rest of the arguments necessary to your template engine
   * @returns The current response object with new body/content-type
   * @since 3.0.0
   */
  public async render<T extends unknown[]>(
    render: (...args: T) => Promise<string>,
    ...args: T
  ): Promise<DrashResponse> {
    this.#body = await render(...args);
    this.#headers.set("content-type", "text/html");
    return this;
  }

  /**
   *
   * Use this method to generate a native Response object. Keep in mind that
   * this response will be frozen, meaning all it's properties are read only.
   *
   * @returns The native Response object based on DrashResponse object
   * @since 3.0.0
   */
  public static generateResponse(response: DrashResponse): Response {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }
}
