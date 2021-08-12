import * as Drash from "../../mod.ts";
import { readAllSync }from "../../deps.ts"

// TODO(crookse TODO-DOCBLOCK) Add docblock.
export class DrashRequest extends Request {
  #original!: Request;
  #parsed_body?: Drash.Types.TRequestBody | null | FormData;
  #path_params!: string;
  #resource!: Drash.Resource;
  #search_params!: URLSearchParams
  #memory: { multipart_form_data: number}

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(
    originalRequest: Request,
    memory?: {
      multipart_form_data: number | undefined
    }
  ) {
    super(originalRequest)
    this.#memory = {
      multipart_form_data: memory!.multipart_form_data || 128
    }
    this.#original = originalRequest!;
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
   * TODO(crookse TODO-CACHE) Cache the parameters so that subsequent calls to
   * this method are faster.
   *
   * Get the paramters on the request.
   *
   * @param type - (optional) The type of params to return. If no type is
   * specified, then all of the params will be returned.
   */
  public params(
    type: "body" | "path" | "query" | undefined = undefined
  ): Drash.Types.TRequestParams | FormData | null {
    switch(type) {
      case "body":
        return this.#parsed_body;
      case "path":
        // TODO :: I dont think using urlsearch params will do the trick for `/users/:id/:age`
        if (!this.#path_params) {
          this.#path_params = new URLSearchParams(this.#resource.path_parameters)
        }
        return this.#path_params;
      case "query":
        if (!this.#search_params) {
          this.#search_params = new URLSearchParams(this.#original.url)
        }
        return this.#search_params;
      default:
        return {
          body: this.#parsed_body,
          path: new URLSearchParams(this.#resource.path_parameters),
          query: this.#search_params,
        };
    }
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
      this.#parsed_body = this.#parseBodyAsFormUrlEncoded(true);
      return;
    }

    if (contentType.includes("multipart/form-data")) {
      this.#parsed_body = await this.#original.formData();
      return;
    }

    if (contentType.includes("application/json")) {
      this.#parsed_body = this.#parseBodyAsJson();
      return;
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
      this.#parsed_body = this.#parseBodyAsFormUrlEncoded();
      return;
    }
  }

  /**
   * Parse the original request's body as application/x-www-form-url-encoded.
   *
   * @returns A `Promise` of an empty object if no body exists, else a key/value
   * pair array (e.g., `returnValue['someKey']`).
   */
  #parseBodyAsFormUrlEncoded(
    parseByDefault = false,
  ): Drash.Interfaces.IKeyValuePairs<unknown> {
    try {
      let body = Drash.Deps.decoder.decode(
        readAllSync(this.#original.body),
      );

      if (body.indexOf("?") !== -1) {
        body = body.split("?")[1];
      }

      body = body.replace(/\"/g, "");

      return {};
    } catch (error) {
      if (parseByDefault) {
        throw new Drash.Errors.HttpError(
          400,
          `Error reading request body. No Content-Type header was specified. ` +
            `Therefore, the body was parsed as application/x-www-form-urlencoded ` +
            `by default and failed.`,
        );
      }
      throw new Drash.Errors.HttpError(
        400,
        `Error reading request body as application/x-www-form-urlencoded. ${error.message}`,
      );
    }
  }

  /**
   * Parse the original request's body as application/json.
   *
   * @returns A `Promise` of a JSON object decoded from request body.
   */
  #parseBodyAsJson(): { [key: string]: unknown } {
    try {
      let data = Drash.Deps.decoder.decode(
        readAllSync(this.#original.body),
      );

      // Check if the JSON string contains ' instead of ". We need to convert
      // those so we can call JSON.parse().
      if (data.match(/'/g)) {
        data = data.replace(/'/g, `"`);
      }

      return JSON.parse(data);
    } catch (error) {
      throw new Drash.Errors.HttpError(
        400,
        `Error reading request body as application/json. ${error.message}`,
      );
    }
  }

  /**
   * Set the resource that is associated with this request on this request.
   */
  public setResource(resource: Drash.Resource): void {
    this.#resource = resource;
  }
}
