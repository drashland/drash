/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
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
 * Middleware that answers preflight requests and sets the `Access-Control-*`
 * headers. CORS is enforced by the browser, not by this middleware.
 *
 * @module
 */

// Imports > Core
import type {
  RequestMethod,
  ResponseStatus,
  ResponseStatusName,
} from "../../core/Types.ts";
import { Method } from "../../core/http/request/Method.ts";
import { StatusCode } from "../../core/http/response/StatusCode.ts";
import { StatusDescription } from "../../core/http/response/StatusDescription.ts";
import { Header } from "../../core/http/Header.ts";

// Imports > Standard
import { Middleware } from "../../standard/http/Middleware.ts";
import { Status } from "../../core/http/response/Status.ts";

// TODO(crookse)
// - [ ] Alphabetize
// - [ ] Doc blocks
// - [ ] Parse the Access-Control-Request-Method header according to https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Request-Method
// - [ ] Handle responses that affect the Vary header
// - [ ] Compare to https://fetch.spec.whatwg.org/#concept-cors-check

/**
 * The `Access-Control-*` values this middleware sends. Every field is optional;
 * anything left unset falls back to {@link defaultOptions}.
 */
type Options = {
  access_control_allow_headers?: string[];
  access_control_allow_methods?: RequestMethod[];
  access_control_allow_origin?: (string | RegExp)[];
  access_control_allow_credentials?: boolean;
  access_control_expose_headers?: string[];
  access_control_max_age?: number;
  options_success_status?: ResponseStatus;
};

/**
 * A permissive default: any origin, the common methods, no credentials.
 * Suitable for a public API; tighten `access_control_allow_origin` for anything
 * that relies on cookies or authorization headers.
 */
const defaultOptions: Options = {
  access_control_allow_headers: [],
  access_control_allow_methods: [
    "GET",
    "HEAD",
    "PUT",
    "PATCH",
    "POST",
    "DELETE",
  ],
  access_control_allow_origin: ["*"],
  access_control_allow_credentials: false,
  access_control_expose_headers: [],
  // access_control_max_age: 5, // MDN says default 5, so should this be 5?
  options_success_status: Status.NoContent,
};

/**
 * Answers preflight requests and adds the `Access-Control-*` headers.
 *
 * CORS is enforced by the browser, not here. These headers tell a browser what
 * it may allow; they do not stop a non-browser client such as `curl` from
 * calling a resource.
 */
class CORSMiddleware extends Middleware {
  #options: Options;

  /**
   * Construct the middleware that handles CORS requests.
   */
  constructor(options: Options = defaultOptions) {
    super();

    // TODO(crookse) Ensure options are correct before setting them
    this.#options = {
      ...defaultOptions,
      ...options,
    };
  }

  /**
   * Handle any non-preflight request by adding the CORS headers to whatever the
   * wrapped resource returns.
   *
   * @param request The request being handled.
   * @returns The resource's response, with the CORS headers added.
   */
  public override ALL(request: Request): Promise<Response> {
    const method = request.method.toUpperCase();

    if (method === Method.OPTIONS) {
      const optionsResponse = this.OPTIONS(request);
      return Promise.resolve(optionsResponse);
    }

    const headers = this.getCorsResponseHeaders(request);

    // Send the request to the requested resource

    return Promise
      .resolve()
      .then(() => super.next<Promise<Response>>(request))
      .then((resourceResponse) => {
        // Merge the resource's response headers with the CORs response headers
        if (resourceResponse.headers) {
          resourceResponse.headers.forEach((value, key) => {
            this.appendHeaderValue({ key, value }, headers);
          });
        }

        return resourceResponse;
      })
      .then((resourceResponse) => {
        return new Response(resourceResponse.body, {
          status: resourceResponse.status || StatusCode.OK,
          statusText: resourceResponse.statusText || StatusDescription.OK,
          headers,
        });
      });
  }

  /**
   * Answer a preflight request directly, without calling the wrapped resource.
   *
   * @param request The preflight request.
   * @returns An empty response carrying the preflight headers, with the status
   * from `options_success_status`.
   */
  public override OPTIONS(request: Request): Response {
    const headers = this.getCorsResponseHeaders(request);
    this.setPreflightHeaders(request, headers);

    let status: ResponseStatus = Status.NoContent;

    if (this.#options.options_success_status) {
      for (const [name, statusCode] of Object.entries(StatusCode)) {
        if (this.#options.options_success_status?.code === statusCode) {
          status = Status[name as ResponseStatusName];
        }
      }
    }

    return new Response(null, {
      status: status.code,
      statusText: status.description,
      headers,
    });
  }

  /**
   * Set every header a preflight response needs.
   *
   * @param request
   * @param headers The headers that will receive the preflight headers.
   */
  protected setPreflightHeaders(request: Request, headers: Headers): void {
    this.setHeaderAllowHeaders(request, headers);
    this.setHeaderAllowMethods(headers);
    this.setHeaderMaxAge(headers);

    // Body is always empty, so the Content-Length header should denote that.
    // This setting helps align with the following RFC:
    //
    //  https://www.rfc-editor.org/rfc/rfc9112#section-6.2
    //
    // In summary, this header must be set to "0" to help clients (e.g., other
    // servers, CDNs, browsers) know where this message ends when they receive
    // it.
    headers.set("content-length", "0");
  }

  /**
   * Append a value to a header, creating it if absent and leaving it alone if the
   * value is already there.
   *
   * @param header The header (in key-value pair format) to add to the current
   * headers.
   * @param headers The current headers.
   */
  protected appendHeaderValue(
    header: { key: string; value: string },
    headers: Headers,
  ): void {
    const currentValue = headers.get(header.key);

    // If the header does not exist yet, then add it
    if (!currentValue) {
      headers.set(header.key, header.value);
      return;
    }

    // For vary headers, we need to check if values were already supplied. If so,
    // then we skip adding them.
    if (
      header.value.toLowerCase() === "vary" &&
      !currentValue.toLowerCase().includes(header.value)
    ) {
      headers.set(header.key, `${headers.get(header.key)}, ${header.value}`);
    }
  }

  /**
   * Work out what `Access-Control-Allow-Origin` should be for this request.
   *
   * Configured entries may be exact strings or regular expressions, and `*`
   * matches anything.
   *
   * @param request
   * @returns The value that should be set in the
   * `Access-Control-Allow-Origin` header.
   */
  protected getAllowOriginHeaderValue(request: Request): string | null {
    if (
      !this.#options.access_control_allow_origin ||
      !this.#options.access_control_allow_origin.length
    ) {
      return "*";
    }

    const origin = request.headers.get("origin");

    if (this.#options.access_control_allow_origin.includes("*")) {
      return "*";
    }

    if (!origin) {
      return null;
    }

    if (this.#options.access_control_allow_origin.includes(origin)) {
      return origin;
    }

    for (const allowedOrigin of this.#options.access_control_allow_origin) {
      if (allowedOrigin instanceof RegExp) {
        if (allowedOrigin.test(origin)) {
          return origin;
        }
      }
    }

    return null;
  }

  /**
   * All CORS-related response headers start out with the values defined in
   * this method.
   * @param request
   * @returns The initial set of headers.
   */
  protected getCorsResponseHeaders(request: Request): Headers {
    const headers = new Headers();

    this.setHeaderExposeHeaders(headers);
    this.setHeaderAllowOrigin(request, headers);
    this.setHeaderAllowCredentials(headers);

    return headers;
  }

  /**
   * Set `Access-Control-Allow-Credentials`, but only when the option is enabled.
   * The header has no `false` form, so it is omitted rather than sent as `false`.
   *
   * @param headers
   * @returns
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials}
   */
  protected setHeaderAllowCredentials(headers: Headers): void {
    if (!this.#options.access_control_allow_credentials) {
      return;
    }

    headers.set(Header.AccessControlAllowCredentials, "true");
  }

  /**
   * Set `Access-Control-Allow-Headers`, echoing what the request asked for when no
   * list was configured.
   *
   * @param headers
   * @returns
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers}
   */
  protected setHeaderAllowHeaders(req: Request, headers: Headers): void {
    let allowedHeaders = req.headers.get(
      Header.AccessControlRequestHeaders,
    );

    if (allowedHeaders) {
      this.appendHeaderValue(
        {
          key: Header.Vary,
          value: Header.AccessControlRequestHeaders,
        },
        headers,
      );
    }

    if (
      this.#options.access_control_allow_headers &&
      this.#options.access_control_allow_headers.length
    ) {
      if (allowedHeaders) {
        allowedHeaders = this.#options.access_control_allow_headers.concat(
          allowedHeaders.split(","),
        ).join(",");
      } else {
        allowedHeaders = this.#options.access_control_allow_headers.join(",");
      }

      headers.set(Header.AccessControlAllowHeaders, allowedHeaders);
    }
  }

  /**
   * Set `Access-Control-Allow-Methods` from the configured method list.
   *
   * @param headers
   * @returns
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Methods}
   */
  protected setHeaderAllowMethods(headers: Headers) {
    if (
      !this.#options.access_control_allow_methods ||
      !this.#options.access_control_allow_methods.length
    ) {
      return;
    }

    headers.set(
      Header.AccessControlAllowMethods,
      this.#options.access_control_allow_methods.join(","),
    );
  }

  /**
   * Set `Access-Control-Allow-Origin`, adding `Vary: Origin` when the value
   * depends on the request — without it a cache could serve one origin's response
   * to another.
   *
   * @param req
   * @param headers
   * @returns
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin}
   */
  protected setHeaderAllowOrigin(request: Request, headers: Headers): void {
    if (
      !this.#options.access_control_allow_origin ||
      !this.#options.access_control_allow_origin.length
    ) {
      return;
    }

    if (this.#options.access_control_allow_origin.includes("*")) {
      headers.set(Header.AccessControlAllowOrigin, "*");
      return;
    }

    const origin = this.getAllowOriginHeaderValue(request);
    headers.set(
      Header.AccessControlAllowOrigin,
      origin ? origin : "false",
    );
    this.appendHeaderValue(
      { key: Header.Vary, value: "Origin" },
      headers,
    );
  }

  /**
   * Set `Access-Control-Expose-Headers`, which is what makes a non-standard
   * response header readable from browser JavaScript.
   *
   * @param headers
   * @returns
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers}
   */
  protected setHeaderExposeHeaders(headers: Headers): void {
    if (
      !this.#options.access_control_expose_headers ||
      !this.#options.access_control_expose_headers.length
    ) {
      return;
    }

    headers.set(
      Header.AccessControlExposeHeaders,
      this.#options.access_control_expose_headers.join(","),
    );
  }

  /**
   * Set `Access-Control-Max-Age`, telling the browser how long it may cache this
   * preflight result.
   *
   * @param headers
   * @returns
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Max-Age}
   */
  protected setHeaderMaxAge(headers: Headers) {
    if (typeof this.#options.access_control_max_age !== "number") {
      return;
    }

    headers.set(
      Header.AccessControlMaxAge,
      `${this.#options.access_control_max_age}`,
    );
  }
}

/**
 * Get the middleware class that handles CORS requests.
 *
 * @param options (Optional) Options to control the middleware's behavior. See
 * {@link Options} for details.
 *
 * @returns The middleware class that can be instantiated. When it is
 * instantiated, it instantiates with the provided `options`. If no options are
 * provided, it uses its default options.
 */
function CORS(options: Options = defaultOptions): new () => CORSMiddleware {
  return class DefaultCORSMiddleware extends CORSMiddleware {
    constructor() {
      super(options);
    }
  };
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { CORS, CORSMiddleware, defaultOptions, type Options };
