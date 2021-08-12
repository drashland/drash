import * as Drash from "../../mod.ts";
import { readAllSync }from "../../deps.ts"

// TODO(crookse TODO-DOCBLOCK) Add docblock.
export class DrashRequest extends Request {
  #original!: Request;
  #parsed_body?: Drash.Types.TRequestBody | null | FormData;
  #path_params!: string;
  #resource!: Drash.DrashResource;
  #search_params!: URLSearchParams

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(
    originalRequest: Request,
  ) {
    super(originalRequest)
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
          // TODO :: Check the perf for this, using NEW URL might decrease perf, if so, we need another way of getting the path
          //this.#path_params = new URLSearchParams(this.#resource.path_parameters)
        }
        //return this.#path_params;
      case "query":
        // TODO :: Check the perf for this, using NEW URL might decrease perf, if so, we need another way of getting the path
        return this.#search_params ?? (this.#search_params = new URLSearchParams(this.#original.url));
      default:
        return {
          body: this.#parsed_body,
          // TODO :: Check the perf for this, using NEW URL might decrease perf, if so, we need another way of getting the path
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

  /**
   * Set the resource that is associated with this request on this request.
   */
  public setResource(resource: Drash.DrashResource): void {
    this.#resource = resource;
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
