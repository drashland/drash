import * as Drash from "../../mod.ts";

export type ParsedBody = Record<string, FormDataEntryValue> | null;

function decodeValue(val: string) {
  return decodeURIComponent(val.replace(/\+/g, " "));
}

// TODO(crookse TODO-DOCBLOCK) Add docblock.
export class DrashRequest extends Request {
  #parsed_body!: ParsedBody;
  #path_params: Map<string, string> = new Map();
  #search_params?: URLSearchParams;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param originalRequest - The original request coming in from
   * `Server.listenForRequests()`.
   */
  constructor(originalRequest: Request, pathParams: Map<string, string>) {
    super(originalRequest);
    this.#path_params = pathParams;
  }

  static async create(request: Request, pathParms: Map<string, string>) {
    const req = new DrashRequest(request, pathParms);
    // here because as it's async, we cant parse it on the fly as we dont
    // want users to have to use await when getting a body param
    if (req.body && req.bodyUsed === false) {
      await req.parseBody();
    }
    return req;
  }

  private async parseBody() {
    this.#parsed_body = await parseBody(this);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Check if the content type in question are accepted by the request.
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
  // TODO(ebebbington): Really don't think there's a need for this, as
  //                    all we're really doing is this.request.headers.get('accept')!.includes(["application/json"]),
  //                    Whilst it's more code than this.accepts(["application/json"]), i wonder if it's worth
  //                    us keeping?
  public accepts(contentType: string): boolean {
    let acceptHeader = this.headers.get("Accept");

    if (!acceptHeader) {
      acceptHeader = this.headers.get("accept");
    }

    if (!acceptHeader) {
      return false;
    }

    return acceptHeader.includes(contentType);
  }

  /**
   * Get a cookie value by the name that is sent in with the request.
   *
   * @param cookie - The name of the cookie to retrieve
   *
   * @returns The cookie value associated with the cookie name or `undefined` if
   * a cookie with that name doesn't exist
   */
  public getCookie(name: string): string {
    const cookies = Drash.Deps.getCookies(
      this.headers,
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
  public bodyParam<T>(name: string): T | null | FormDataEntryValue {
    return this.#parsed_body![name] ?? null;
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
   * @param name The parameter name, as set in your paths
   *
   * @returns The value for the parameter, or null if not set
   */
  public pathParam(name: string): string | undefined {
    return this.#path_params.get(name);
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
      this.#search_params = new URL(this.url).searchParams;
    }
    return this.#search_params.get(name);
  }
}

async function constructFormDataUsingBody(
  request: Request,
): Promise<Record<string, FormDataEntryValue>> {
  const formData = await request.formData();
  const formDataJSON: Record<string, FormDataEntryValue> = {};
  for (const [key, value] of formData.entries()) {
    formDataJSON[key] = value;
  }
  return formDataJSON;
}

async function parseBody(
  request: Request,
): Promise<Record<string, FormDataEntryValue>> {
  const contentType = request.headers.get(
    "Content-Type",
  );
  if (!contentType) {
    return await constructFormDataUsingBody(request);
  }
  if (contentType.includes("multipart/form-data")) {
    return await constructFormDataUsingBody(request);
  }
  if (contentType.includes("application/json")) {
    return await request.json();
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return await constructFormDataUsingBody(request);
  }
  return await constructFormDataUsingBody(request);
  // TODO :: Handle text plain, eg body: "hello"?
}
