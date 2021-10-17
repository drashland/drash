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
   * Construct an object of this class.
   *
   * This class is just a wrapper around the native Request object. The only
   * reason we wrap around the native Request object is so we can add more
   * methods to interact with the native Request object (e.g., req.bodyParam()).
   *
   * @param originalRequest - The original request coming in from
   * `Server.listenForRequests()`.
   * @param pathParams - The path params to match the request's URL to. The path
   * params come from a resource's path(s).
   */
  constructor(
    originalRequest: Request,
    pathParams: Map<string, string>,
  ) {
    super(originalRequest);
    this.#path_params = pathParams;
  }

  /**
   * Create a Drash request object. We use this method to create request objects
   * because we need to use `async-await` and cannot use them in constructor
   * methods. This is the only reason for this abstraction.
   *
   * @param request - The original request.
   * @param pathParams - The path params to match the request's URL to. The path
   * params come from a resource's path(s).
   *
   * @returns A Drash request object.
   */
  static async create(
    request: Request,
    pathParms: Map<string, string>,
  ) {
    const req = new DrashRequest(request, pathParms);
    // This is here because `parseBody` is async. We can't parse the request
    // body on the fly as we dont want users to have to use await when getting a
    // body param.
    if (req.body && req.bodyUsed === false) {
      req.#parsed_body = await req.#parseBody();
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
   * @returns The value of the parameter if found, or undefined if not found.
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
   * @returns A parsed body based on the content type of the request body.
   */
  async #parseBody(): Promise<ParsedBody> {
    const contentType = this.headers.get(
      "Content-Type",
    );
    if (!contentType) {
      return await this.#constructFormDataUsingBody();
    }
    if (contentType.includes("multipart/form-data")) {
      return await this.#constructFormDataUsingBody();
    }
    if (contentType.includes("application/json")) {
      return await this.json();
    }
    if (contentType.includes("application/x-www-form-urlencoded")) {
      return await this.#constructFormDataUsingBody();
    }
    if (contentType.includes("text/plain")) {
      return await this.text();
    }
    return await this.#constructFormDataUsingBody();
  }

  /**
   * Get a path parameter from the request based on the request's URL and the
   * resource path it matched to.
   *
   * @example
   * ```js
   * // Assume a path for your resource is "/users/:id/:city?", and the request
   * // is "/users/2/".
   * const id = this.paramParam("id") // Returns 2
   * const city = this.queryParam("city") // Returns undefined
   * ```
   *
   * @param name - The parameter name in the resource path.
   *
   * @returns The value for the parameter if found, or undefined if not set.
   */
  public pathParam(name: string): string | undefined {
    const param = this.#path_params.get(name);
    if (!param) {
      return undefined;
    }
    return this.#decodeValue(param);
  }

  /**
   * Find a query string parameter.
   *
   * @example
   * ```js
   * // Assume url is "http://localhost:1336/users?city=London&country=England"
   * const city = this.queryParam("city") // Returns "London"
   * const country = this.queryParam("country") // Returns "England"
   * ```
   *
   * @param name - The name of the query string.
   *
   * @returns The value of the param if found, or undefined if not.
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
   * @returns The form data body as a key-value pair object.
   */
  async #constructFormDataUsingBody(): Promise<ParsedBody> {
    const formData = await this.formData();
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
