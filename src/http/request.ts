import { getCookies } from "../../deps.ts";
import { Errors } from "../../mod.ts";
import type { ConnInfo } from "../../deps.ts";
import { BodyFile } from "../types.ts";

export type ParsedBody =
  | Record<string, string | BodyFile | BodyFile[]>
  | undefined
  | string;

/**
 * A class that holds the representation of an incoming request
 */
export class DrashRequest extends Request {
  public conn_info: ConnInfo;

  #end_lifecycle = false;
  #original: Request;
  #parsed_body?: ParsedBody;
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
   * @param originalRequest - The original request coming.
   * @param pathParams - The path params to match the request's URL to. The path
   * params come from a resource's path(s).
   * @param connInfo - The connection information for the current request
   */
  constructor(
    originalRequest: Request,
    pathParams: Map<string, string>,
    connInfo: ConnInfo,
  ) {
    super(originalRequest);
    this.#path_params = pathParams;
    this.conn_info = connInfo;
    this.#original = originalRequest.clone();
  }

  //////////////////////////////////////////////////////////////////////////////
  // GETTERS / SETTERS /////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  get end_lifecycle(): boolean {
    return this.#end_lifecycle;
  }

  get original(): Request {
    return this.#original;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - STATIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create a Drash request object. We use this method to create request objects
   * because we need to use `async-await` and cannot use them in constructor
   * methods. This is the only reason for this abstraction.
   *
   * @param request - The original request.
   * @param pathParams - The path params to match the request's URL to. The path
   * params come from a resource's path(s).
   * @param connInfo - The connection info Deno provides on a new request
   *
   * @returns A Drash request object.
   */
  static async create(
    request: Request,
    pathParams: Map<string, string>,
    connInfo: ConnInfo,
  ) {
    const req = new DrashRequest(request, pathParams, connInfo);
    await req.prepare();
    return req;
  }

  /**
   * Try prepare ParsedBody for resources, etc
   */
  async prepare() {
    // This is here because `parseBody` is async. We can't parse the request
    // body on the fly as we dont want users to have to use await when getting a
    // body param.
    const req = this.original;
    const contentLength = req.headers.get("content-length") ?? "0";
    if (req.body && req.bodyUsed === false && contentLength !== "0") {
      this.#parsed_body = await this.#parseBody();
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Check if the content type in question are accepted by the request.
   *
   * @param contentType - A proper MIME type. See /src/dictionaries/mime_db.ts for proper MIME types
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
   * Set this request to end early? Calling this will tell the request to stop
   * where it is at in the request-resource-response lifecycle and immediately
   * return a response.
   */
  public end(): void {
    this.#end_lifecycle = true;
  }

  /**
   * Get a cookie value by the name that is sent in with the request.
   *
   * @param name - The name of the cookie to retrieve
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
   * @returns The value of the parameter if found, or `undefined` if not found.
   */
  public bodyParam<T>(name: string): T | undefined {
    if (this.#parsed_body === undefined) {
      return undefined;
    }

    if (typeof this.#parsed_body !== "object") {
      return undefined;
    }

    if (this.#parsed_body[name] === undefined) {
      return undefined;
    }

    return this.#parsed_body[name] as unknown as T;
  }

  /**
   * Get all body params.
   *
   * @returns All params contained in the body or an empty body if no params
   * exist.
   */
  public bodyAll<T>(): ParsedBody | T {
    if (this.#parsed_body === undefined) {
      return {};
    }

    if (typeof this.#parsed_body !== "object") {
      return {};
    }

    return this.#parsed_body;
  }

  /**
   * Parse the request body.
   *
   * @returns A parsed body based on the content type of the request body.
   */
  async #parseBody(): Promise<ParsedBody> {
    const contentLength = this.headers.get("content-length");

    // The Content-Length header indicates that the client is sending a body.
    // Some clients send a Content-Length header of "0", which indicates that
    // there is in fact no body present with the request. We need to check for
    // this or else we try to parse a body for no reason.
    if (!contentLength || contentLength === "0") {
      return undefined;
    }

    // If we get to this point, then that means there is a body (since the
    // Content-Length header is greater than 0). In order for us to parse the
    // body, we need to know the Content-Type of the body. Otherwise, we have
    // no way of knowing how to parse it. We can assume, but let's just tell the
    // client to modify their request to include the Content-Type header.
    const contentType = this.headers.get("content-type");

    if (!contentType) {
      throw new Errors.HttpError(
        400,
        "Bad Request. The request body cannot be parsed due to the Content-Type header missing.",
      );
    }

    try {
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

      // If all else fails, then try to parse the body using FormData
      return await this.#constructFormDataUsingBody();
    } catch (_e) {
      throw new Errors.HttpError(
        422,
        "Unprocessable Entity. The request body seems to be invalid as there was an error parsing it.",
      );
    }
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
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
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
        const content = new Uint8Array(await value.arrayBuffer());
        const file = {
          size: value.size,
          type: value.type,
          content,
          filename: value.name,
        };
        if (key.endsWith("[]")) {
          const name = key.slice(0, -2);
          if (!formDataJSON[name]) {
            formDataJSON[name] = [];
          }
          (formDataJSON[name] as BodyFile[]).push(file);
        } else {
          formDataJSON[key] = file;
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
