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

import { HttpError } from "./errors.ts";
import { StatusCodeRegistry } from "../http/status_code_registry.ts";
import * as Enums from "../enums.ts";
import * as Interfaces from "../interfaces.ts";
import * as Types from "../types.ts";

/**
 * A builder to help create/update a response object. This is used until the
 * last step of the request-resource-response which is calling the
 * `toNativeResponse()` method -- sending a native `Response` object to the
 * runtime for further processing.
 */
export class ResponseBuilder implements Interfaces.ResponseBuilder {
  #state: {
    body?: BodyInit | null;
    error?: Error;
    headers?: Headers;
    status?: Enums.StatusCode;
    statusText?: string;
    upgrade?: Response;
  } = {};

  // FILE MARKER - GETTERS/SETTERS /////////////////////////////////////////////

  get body_init() {
    return this.#state.body as BodyInit;
  }

  get headers_init() {
    return this.#state.headers;
  }

  // FILE MARKER - METHODS - PUBLIC (EXPOSED) //////////////////////////////////
  //
  // These methods are documented by the interface.

  public body<T extends BodyInit | string>(
    body: T | null,
  ): this;
  public body<T extends BodyInit | string>(
    contentType: string,
    body: T | null,
  ): this;
  public body<T extends BodyInit | string>(
    evaluatee: T | string,
    body?: T | string | null,
  ): this {
    if (typeof evaluatee === "string" && body !== undefined) {
      return this.#setResponseBody(evaluatee, body);
    }

    this.#state.body = evaluatee;

    return this;
  }

  public deleteCookies(cookies: string[]): this {
    cookies.forEach((cookie: string) => {
      this.cookies({
        [cookie]: {
          name: cookie,
          value: "",
          expires: new Date(0), // 1970-01-01T00:00:00.000Z
        },
      });
    });

    return this;
  }

  public error(statusCode: Enums.StatusCode, reason?: string): this {
    this.#state.error = new HttpError(statusCode, reason);

    return this;
  }

  public html(html: string): this {
    return this.#setResponseBody("text/html", html);
  }

  public json<T extends Record<string, unknown> | unknown[]>(json: T): this {
    return this.#setResponseBody("application/json", JSON.stringify(json));
  }

  public redirect(
    location: string,
  ): this {
    // TODO(crookse) Complete the implementation and make sure that the
    // redirection meets the MDN spec
    this.headers({
      "Location": location,
    });

    this.status(Enums.StatusCode.TemporaryRedirect);

    return this;
  }

  public cookies(cookies: Record<string, Partial<Types.Cookie>>): this {
    const currentCookiesObj = this.#parseCookies(
      this.#state.headers?.get("set-cookie") || "",
    );

    for (const cookieName in cookies) {
      const cookieValue = cookies[cookieName];
      currentCookiesObj[cookieName] = cookieValue as Types.Cookie;
    }

    const cookieString = this.#createCookieString(currentCookiesObj);

    this.headers({ "set-cookie": cookieString });

    return this;
  }

  public headers(headers: Record<string, string>): this {
    if (!this.#state.headers) {
      this.#state.headers = new Headers();
    }

    for (const header in headers) {
      const value = headers[header];
      this.#state.headers.set(header, value);
    }

    return this;
  }

  public status(status: Enums.StatusCode): this {
    const registry = StatusCodeRegistry.get(status);

    if (!registry) {
      throw new Error(`Status code ${status} is not a valid HTTP status code.`);
    }

    this.#state.status = registry.value;
    this.#state.statusText = registry.description;

    return this;
  }

  public text(text: string): this {
    return this.#setResponseBody("text/plain", text);
  }

  public upgrade(response: Response): this {
    this.#state.upgrade = response;
    return this;
  }

  public xml(xml: string): this {
    return this.#setResponseBody("text/xml", xml);
  }

  // FILE MARKER - GETTERS / SETTERS ///////////////////////////////////////////

  get error_init() {
    return this.#state.error;
  }

  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////

  /**
   * Turn this object into a native `Response` object.
   *
   * @returns This object as a native `Response` object.
   */
  public toNativeResponse(): Response {
    if (this.#state.upgrade) {
      return this.#state.upgrade;
    }

    if (
      this.#state.headers ||
      this.#state.body ||
      this.#state.status
    ) {
      const statusFields = {
        status: 200,
        statusText: StatusCodeRegistry.get(200)?.description,
      };

      if (this.#state.status) {
        statusFields.status = this.#state.status;
        statusFields.statusText =
          StatusCodeRegistry.get(this.#state.status)?.description || "";
      }

      return new Response(this.#state.body, {
        headers: this.#state.headers ?? new Headers(),
        ...statusFields,
      });
    }

    return new Response(this.#state.body);
  }

  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////

  /**
   * Set the body of the repsonse (used by methods like `.json()`, `.html()`,
   * etc.)
   *
   * @param contentType - The content type to set on this response's
   * Content-Type header.
   * @param body - The body of this response.
   * @returns `this` object for method chaining.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation
   */
  #setResponseBody(contentType: string, body: BodyInit | null): this {
    this.headers({
      "Content-Type": contentType,
    });

    this.#state.body = body;

    return this;
  }

  #parseCookies(cookies: string): Record<string, Types.Cookie> {
    if (!cookies) {
      return {};
    }

    if (typeof cookies != "string") {
      return {};
    }

    if (cookies.trim() === "") {
      return {};
    }

    const cookiesArray = cookies.split(";");

    const ret: Record<string, Types.Cookie> = {};

    for (const keyValueStore of cookiesArray) {
      const [cookieKey, cookieVal] = keyValueStore.split("=");
      const key = cookieKey.trim();

      ret[key] = cookieVal as unknown as Types.Cookie;
    }

    return ret;
  }

  #createCookieAttributesString(cookie: Types.Cookie): string {
    const cookieValueArray = [];

    // These keys are not attributes. They are for internal use only.
    const internalKeys = [
      "name",
      "value",
    ];

    for (let key in cookie) {
      key = key.trim();

      if (internalKeys.includes(key)) {
        continue;
      }

      let httpSpecSafeKey = key.replace("_", "-");

      httpSpecSafeKey.split("-").forEach((part: string) => {
        httpSpecSafeKey = httpSpecSafeKey.replace(
          part,
          part.charAt(0).toUpperCase() + part.slice(1),
        );
      });

      cookieValueArray.push(
        `${httpSpecSafeKey}=${cookie[key as keyof Types.Cookie]}`,
      );
    }

    return cookieValueArray.join("; ").trim();
  }

  #createCookieString(cookies: Record<string, Types.Cookie>): string {
    const cookiesArray = [];

    for (const cookie in cookies) {
      cookiesArray.push(
        `${cookie}=${cookies[cookie].value}; ${
          this.#createCookieAttributesString(cookies[cookie])
        }`,
      );
    }

    let cookieString = cookiesArray.join(";").trim();

    // Remove the trailing semicolon
    if (cookieString.charAt(cookieString.length - 1) === ";") {
      cookieString = cookieString.substring(-1, cookieString.length - 1);
    }

    return cookieString;
  }
}
