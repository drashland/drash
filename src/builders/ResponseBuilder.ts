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

import { HTTPError } from "../core/errors/HTTPError.ts";
import { StatusCodeRegistry } from "../core/http/StatusCodeRegistry.ts";
import * as Enums from "../core/Enums.ts";
import * as Types from "../core/Types.ts";
import * as Interfaces from "../core/Interfaces.ts";

/**
 * A builder to help create/update a response object. This builder is used
 * throughout the entire request-resource-response lifecycle until the very last
 * step of the lifecycle. The last step builds the response. The result is an
 * instance of `GenericResponse`.
 */
export class ResponseBuilder implements Interfaces.ResponseBuilder {
  #state: Types.ResponseBuilderState;

  // FILE MARKER - GETTERS / SETTERS (EXPOSED) /////////////////////////////////
  //
  // These getters/setters are documented by the interface.

  get state(): Types.ResponseBuilderState {
    return this.#state;
  }

  constructor() {
    this.#state = {
      headers: new Headers(),
      status: StatusCodeRegistry.get(200)?.value!,
      status_text: StatusCodeRegistry.get(200)?.description!,
    };
  }

  // FILE MARKER - METHODS - PUBLIC (EXPOSED) //////////////////////////////////
  //
  // These methods are documented by the interface.

  public body<T extends BodyInit>(
    body: T,
  ): this;
  public body<T extends BodyInit>(
    contentType: string,
    body: T,
  ): this;
  public body<T extends BodyInit>(
    evaluatee: T,
    body?: T,
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

  public error(statusCode: Enums.HTTPStatusCode, reason?: string): this {
    this.#state.error = new HTTPError(statusCode, reason);

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

    this.status(Enums.HTTPStatusCode.TemporaryRedirect);

    return this;
  }

  public cookies(cookies: Record<string, Partial<Types.Cookie>>): this {
    const currentCookiesObj = this.#parseCookies(
      this.#state.headers ? this.#state.headers.get("set-cookie") || "" : "",
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
    for (const header in headers) {
      const value = headers[header];
      this.#state.headers.set(header, value);
    }

    return this;
  }

  public status(status: Enums.HTTPStatusCode): this {
    const registry = StatusCodeRegistry.get(status);

    if (!registry) {
      throw new Error(`Status code ${status} is not a valid HTTP status code.`);
    }

    this.#state.status = registry.value;
    this.#state.status_text = registry.description;

    return this;
  }

  public text(text: string): this {
    return this.#setResponseBody("text/plain", text);
  }

  public upgrade(response: Response | ResponseBuilder): this {
    if (response instanceof ResponseBuilder) {
      this.#state.upgrade = response.build();
    } else {
      this.#state.upgrade = response;
    }

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
  build(): Response {
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
        // @ts-ignore: TODO(crookse) Need to account for HeadersInit not in Node
        headers: this.#state.headers ?? new Map<string, string>(), // new Headers(),
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
  #setResponseBody(
    contentType: string,
    body: BodyInit,
  ): this {
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
