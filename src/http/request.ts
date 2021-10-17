import { deferred, getCookies } from "../../deps.ts";

export type ParsedBody =
  | Record<string, string | BodyFile | BodyFile[]>
  | undefined
  | string;

type BodyFile = {
  content: unknown;
  size: number;
  type: string;
  filename: string;
};

/**
 * A class that holds the representation of an incoming request
 */
export class DrashRequest extends Request {
  #parsed_body!: ParsedBody;
  readonly #path_params: Map<string, string>;
  #search_params!: URLSearchParams;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param originalRequest - The original request coming in from
   * `Server.listenForRequests()`.
   */
  constructor(
    originalRequest: Request,
    pathParams: Map<string, string>,
  ) {
    super(originalRequest);
    this.#path_params = pathParams;
  }

  static async create(
    request: Request,
    pathParms: Map<string, string>,
  ) {
    const req = new DrashRequest(request, pathParms);
    // here because as it's async, we cant parse it on the fly as we dont
    // want users to have to use await when getting a body param
    if (req.body && req.bodyUsed === false) {
      req.#parsed_body = await req.parseBody(req);
    }
    return req;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Check if the content type in question are accepted by the request.
   *
   * @param contentType - A proper MIME type. See mime.ts for proper MIME types
   * that Drash can handle.
   *
   * @returns True if yes, false if no.
   */
  public accepts(contentType: string): boolean {
    const acceptHeader = this.headers.get("Accept");
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
    const cookies = getCookies(
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
   * const user = request.bodyParam<{ name: string }>("user") // { name: "Drash" }
   * // More examples:
   * request.bodyParam<BodyFile[]>('uploads')
   * ```
   *
   * @param name The body parameter name
   *
   * @returns The value of the parameter, or null if not found
   */
  public bodyParam<T>(name: string): T | undefined {
    if (typeof this.#parsed_body !== "object") {
      return undefined;
    }
    return this.#parsed_body![name] as unknown as T ?? undefined;
  }

  /**
   * Parse the request body.
   *
   * @param request - The request with the body.
   *
   * @returns A parsed body based on the content type of the request body.
   */
  public async parseBody(
    request: Request,
  ): Promise<ParsedBody> {
    const contentType = request.headers.get(
      "Content-Type",
    );
    if (!contentType) {
      return await this.#constructFormDataUsingBody(request);
    }
    if (contentType.includes("multipart/form-data")) {
      return await this.#constructFormDataUsingBody(request);
    }
    if (contentType.includes("application/json")) {
      return await request.json();
    }
    if (contentType.includes("application/x-www-form-urlencoded")) {
      return await this.#constructFormDataUsingBody(request);
    }
    if (contentType.includes("text/plain")) {
      return await request.text();
    }
    return await this.#constructFormDataUsingBody(request);
  }
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
    const param = this.#path_params.get(name);
    if (!param) {
      return undefined;
    }
    return this.#decodeValue(param);
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
  public queryParam(name: string): string | undefined {
    if (!this.#search_params) {
      this.#search_params = new URL(this.url).searchParams;
    }
    const param = this.#search_params.get(name);
    if (!param) {
      return undefined;
    }
    return this.#decodeValue(param);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PRIVATE METHODS /////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct the form data of a request body.
   *
   * @param request - The request with the form data body.
   *
   * @returns The form data body as a key-value pair object.
   */
  async #constructFormDataUsingBody(
    request: Request,
  ): Promise<ParsedBody> {
    const formData = await request.formData();
    const formDataJSON: ParsedBody = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const reader = new FileReader();
        const p = deferred();
        reader.readAsText(value);
        reader.onload = () => {
          p.resolve(reader.result);
        };
        const content = await p;
        if (key.endsWith("[]")) {
          const name = key.slice(0, -2);
          if (!formDataJSON[name]) {
            formDataJSON[name] = [];
          }
          (formDataJSON[name] as BodyFile[]).push({
            size: value.size,
            type: value.type,
            content,
            filename: value.name,
          });
        } else {
          formDataJSON[key] = {
            size: value.size,
            type: value.type,
            content,
            filename: value.name,
          };
        }
        continue;
      }
      formDataJSON[key] = value as string;
    }
    return formDataJSON;
  }

  /**
   * Decode a URI component -- netrualizing the string by replacing characters
   * not required.
   *
   * @param value - The string to decode.
   *
   * @returns The neutralized string.
   */
  #decodeValue(value: string): string {
    return decodeURIComponent(value.replace(/\+/g, " "));
  }
}
