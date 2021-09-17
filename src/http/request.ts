import * as Drash from "../../mod.ts";

export type ParsedBody = Record<string, FormDataEntryValue> | null | Record<string, unknown>

// TODO(crookse TODO-DOCBLOCK) Add docblock.
export class DrashRequest extends Request {
  #original: Request;
  #parsed_body?: ParsedBody;
  #path_params: Map<string, string> = new Map();
  #search_params?: URLSearchParams

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param originalRequest - The original request coming in from
   * `Server.listenForRequests()`.
   */
  constructor(originalRequest: Request) {
    super(originalRequest)
    this.#original = originalRequest;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Check if the content type(s) in question are accepted by the request.
   *
   * TODO-REQUEST-ACCEPTS(crookse) Respect the priority of what is accepted. See
   * q-factor weighting at the following:
   *
   *     https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept.
   *
   * @param contentType - A proper MIME type. See mime.ts for proper MIME types
   * that Drash can handle.
   *
   * @returns True if yes, false if no.
   */
  public accepts(contentTypes: string[]): boolean {
    let acceptHeader = this.#original.headers.get("Accept");

    if (!acceptHeader) {
      acceptHeader = this.#original.headers.get("accept");
    }

    if (!acceptHeader) {
      return false;
    }

    return contentTypes.includes(acceptHeader);
  }

  /**
   * TODO(crookse TODO-REQUEST-COOKIE) Make sure this still works.
   *
   * Get a cookie value by the name that is sent in with the request.
   *
   * @param cookie - The name of the cookie to retrieve
   *
   * @returns The cookie value associated with the cookie name or `undefined` if
   * a cookie with that name doesn't exist
   */
  public getCookie(name: string): string {
    const cookies = Drash.Deps.getCookies(
      this.#original,
    );
    return cookies[name];
  }

  /**
   * Get a body parameter of the request by the name
   * 
   * @example
   * ```js
   * // Assume you've sent a fetch request with:
   * //   {
   * //     user: {
   * //       name: "Drash"
   * //     }
   * //   }
   * const user = this.bodyParam<{ name: string }>("user") // { name: "Drash" }
   * ```
   * 
   * @param name The body parameter name
   * 
   * @returns The value of the parameter, or null if not found 
   */
  public bodyParam<T>(name: string): T | null | unknown {
    if (!this.#parsed_body) {
      return null
    }
    return this.#parsed_body[name] ?? null
  }

  /**
   * Get a path parameter of the request
   * 
   * @example
   * ```js
   * // Assume a path for your resource is "/users/:id/:city?", and the request is
   * // "/users/2/"
   * const id = this.paramParam("id") // 2
   * const city = this.queryParam("city") // undefined
   * ```
   * 
   * @param name The parameter name, as set in your static paths
   * 
   * @returns The value for the parameter, or null if not set
   */
  public pathParam(name: string): string | undefined {
    if (!this.#path_params.size) {
      // todo set the params
    }
    return this.#path_params.get(name)
  }

  /**
   * Find a query string parameter
   * 
   * @example
   * ```js
   * // Assume url is "http://localhost:1336/users?city=London&country=England"
   * const city = this.queryParam("city") // "London"
   * const country = this.queryParam("country") // "England"
   * ```
   * 
   * @param name The name of the query string
   * 
   * @returns The value if found, or null if not
   */
  public queryParam(name: string): string | null {
    if (!this.#search_params) {
      this.#search_params = new URL(this.#original.url).searchParams
    }
    return this.#search_params.get(name)
  }

  /**
   * Parse the specified request's body if there is a body.
   */
  // TODO :: Ideally we wouldn't make this accessible to users
  public async parseBody(): Promise<void> {
    if (!this.body) {
      this.#parsed_body = null
      return;
    }

    const contentType = this.#original.headers.get(
      "Content-Type",
    );

    // No Content-Type header? Default to parsing the request body as
    // aplication/x-www-form-urlencoded.
    if (!contentType) {
      this.#parsed_body = await this.#constructFormDataUsingBody()
      return;
    }

    if (contentType.includes("multipart/form-data")) {
      this.#parsed_body = await this.#constructFormDataUsingBody()
      return;
    }

    if (contentType.includes("application/json")) {
      this.#parsed_body = await this.#original.json();
      return;
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
      this.#parsed_body = await this.#constructFormDataUsingBody()
      return;
    }

    // TODO :: Handle text plain, eg body: "hello"?
  }

  async #constructFormDataUsingBody(): Promise<Record<string, FormDataEntryValue>> {
    const formData = await this.#original.formData();
      const formDataJSON: Record<string, FormDataEntryValue> = {};
      for (const [key, value] of formData.entries()) {
        formDataJSON[key] = value;
      }
      return formDataJSON
  }
}
