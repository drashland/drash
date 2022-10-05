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
var _AbstractResponseBuilder_instances,
  _AbstractResponseBuilder_setResponseBody,
  _AbstractResponseBuilder_parseCookies,
  _AbstractResponseBuilder_createCookieAttributesString,
  _AbstractResponseBuilder_createCookieString;
import { HttpError } from "../errors.js";
import { StatusCodeRegistry } from "../../http/status_code_registry.js";
import * as Enums from "../../enums.js";
/**
 * A builder to help create/update a response object. This builder is used
 * throughout the entire request-resource-response lifecycle until the very last
 * step of the lifecycle. The last step builds the response. The result is an
 * instance of `GenericResponse`.
 * @template GenericResponse The response this builder builds.
 * @template GenericBody The response's body type (e.g, `BodyInit`).
 * @template GenericHeaders The response's headers type (e.g., `Headers`).
 */
export class AbstractResponseBuilder {
  constructor() {
    _AbstractResponseBuilder_instances.add(this);
    this.current_state = {};
  }
  // FILE MARKER - GETTERS / SETTERS (EXPOSED) /////////////////////////////////
  //
  // These getters/setters are documented by the interface.
  get body_init() {
    return this.current_state.body;
  }
  get headers_init() {
    return this.current_state.headers;
  }
  body(evaluatee, body) {
    if (typeof evaluatee === "string" && body !== undefined) {
      return __classPrivateFieldGet(
        this,
        _AbstractResponseBuilder_instances,
        "m",
        _AbstractResponseBuilder_setResponseBody,
      ).call(this, evaluatee, body);
    }
    this.current_state.body = evaluatee;
    return this;
  }
  deleteCookies(cookies) {
    cookies.forEach((cookie) => {
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
  error(statusCode, reason) {
    this.current_state.error = new HttpError(statusCode, reason);
    return this;
  }
  html(html) {
    return __classPrivateFieldGet(
      this,
      _AbstractResponseBuilder_instances,
      "m",
      _AbstractResponseBuilder_setResponseBody,
    ).call(this, "text/html", html);
  }
  json(json) {
    return __classPrivateFieldGet(
      this,
      _AbstractResponseBuilder_instances,
      "m",
      _AbstractResponseBuilder_setResponseBody,
    ).call(this, "application/json", JSON.stringify(json));
  }
  redirect(location) {
    // TODO(crookse) Complete the implementation and make sure that the
    // redirection meets the MDN spec
    this.headers({
      "Location": location,
    });
    this.status(Enums.StatusCode.TemporaryRedirect);
    return this;
  }
  cookies(cookies) {
    const currentCookiesObj = __classPrivateFieldGet(
      this,
      _AbstractResponseBuilder_instances,
      "m",
      _AbstractResponseBuilder_parseCookies,
    ).call(
      this,
      this.current_state.headers
        ? this.current_state.headers["set-cookie"] || ""
        : "",
    );
    for (const cookieName in cookies) {
      const cookieValue = cookies[cookieName];
      currentCookiesObj[cookieName] = cookieValue;
    }
    const cookieString = __classPrivateFieldGet(
      this,
      _AbstractResponseBuilder_instances,
      "m",
      _AbstractResponseBuilder_createCookieString,
    ).call(this, currentCookiesObj);
    this.headers({ "set-cookie": cookieString });
    return this;
  }
  headers(headers) {
    if (!this.current_state.headers) {
      this.current_state.headers = {};
    }
    for (const header in headers) {
      const value = headers[header];
      this.current_state.headers[header] = value;
    }
    return this;
  }
  status(status) {
    const registry = StatusCodeRegistry.get(status);
    if (!registry) {
      throw new Error(`Status code ${status} is not a valid HTTP status code.`);
    }
    this.current_state.status = registry.value;
    this.current_state.statusText = registry.description;
    return this;
  }
  text(text) {
    return __classPrivateFieldGet(
      this,
      _AbstractResponseBuilder_instances,
      "m",
      _AbstractResponseBuilder_setResponseBody,
    ).call(this, "text/plain", text);
  }
  upgrade(response) {
    this.current_state.upgrade = response;
    return this;
  }
  xml(xml) {
    return __classPrivateFieldGet(
      this,
      _AbstractResponseBuilder_instances,
      "m",
      _AbstractResponseBuilder_setResponseBody,
    ).call(this, "text/xml", xml);
  }
  // FILE MARKER - GETTERS / SETTERS ///////////////////////////////////////////
  get error_init() {
    return this.current_state.error;
  }
}
_AbstractResponseBuilder_instances = new WeakSet(),
  _AbstractResponseBuilder_setResponseBody =
    function _AbstractResponseBuilder_setResponseBody(contentType, body) {
      this.headers({
        "Content-Type": contentType,
      });
      this.current_state.body = body;
      return this;
    },
  _AbstractResponseBuilder_parseCookies =
    function _AbstractResponseBuilder_parseCookies(cookies) {
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
      const ret = {};
      for (const keyValueStore of cookiesArray) {
        const [cookieKey, cookieVal] = keyValueStore.split("=");
        const key = cookieKey.trim();
        ret[key] = cookieVal;
      }
      return ret;
    },
  _AbstractResponseBuilder_createCookieAttributesString =
    function _AbstractResponseBuilder_createCookieAttributesString(cookie) {
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
        httpSpecSafeKey.split("-").forEach((part) => {
          httpSpecSafeKey = httpSpecSafeKey.replace(
            part,
            part.charAt(0).toUpperCase() + part.slice(1),
          );
        });
        cookieValueArray.push(`${httpSpecSafeKey}=${cookie[key]}`);
      }
      return cookieValueArray.join("; ").trim();
    },
  _AbstractResponseBuilder_createCookieString =
    function _AbstractResponseBuilder_createCookieString(cookies) {
      const cookiesArray = [];
      for (const cookie in cookies) {
        cookiesArray.push(
          `${cookie}=${cookies[cookie].value}; ${
            __classPrivateFieldGet(
              this,
              _AbstractResponseBuilder_instances,
              "m",
              _AbstractResponseBuilder_createCookieAttributesString,
            ).call(this, cookies[cookie])
          }`,
        );
      }
      let cookieString = cookiesArray.join(";").trim();
      // Remove the trailing semicolon
      if (cookieString.charAt(cookieString.length - 1) === ";") {
        cookieString = cookieString.substring(-1, cookieString.length - 1);
      }
      return cookieString;
    };
//# sourceMappingURL=response_builder.js.map
