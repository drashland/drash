import * as Drash from "../../mod.ts";

// TODO(crookse TODO-DOCBLOCK) Add docblock.
export class Request {
  #options!: Drash.Interfaces.IRequestOptions;
  #original!: Drash.Deps.ServerRequest;
  #parsed_body?: Drash.Types.TRequestBody;
  #path_parameters!: string;
  #resource!: Drash.Resource;
  #server!: Drash.Server;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * See Drash.Interfaces.ICreateable.create().
   */
  public async create(
    options: Drash.Interfaces.IRequestOptions,
  ): Promise<void> {
    this.#setOptions(options);
    this.#setProperties();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - GETTERS AND SETTERS /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Get the ORIGINAL request's body.
   */
  get body(): Deno.Reader {
    return this.#original.body;
  }

  /**
   * Does the ORIGINAL request have a body?
   */
  get has_body(): boolean {
    const contentLength = this.#original.headers.get("content-length") ??
      this.#original.headers.get("Content-Length");

    if (!contentLength) {
      return false;
    }

    return +contentLength > 0;
  }

  /**
   * Get the ORIGINAL request's HTTP method.
   */
  get method(): string {
    return this.#original.method;
  }

  /**
   * This getter returns an object that matches the object that is returned by
   * using `new URL()`. The reason this is done manually is because it is faster
   * than using `new URL()` every time a request is made to the server.
   */
  get url(): Drash.Interfaces.IRequestUrl {
    const anchorSplit = this.#original.url.includes("#")
      ? this.#original.url.split("#")
      : null;
    const anchor = anchorSplit
      ? anchorSplit[anchorSplit.length - 1]
      : undefined;

    const parametersSplit = this.#original.url.includes("?")
      ? this.#original.url.split("?")[1]
      : null;
    const parameters = parametersSplit
      ? parametersSplit.split("#").join("")
      : undefined;

    const path = this.#original.url.split("?")[0];

    const scheme = this.#server.options.protocol!;

    const authority = this.#original.headers.get("host") ?? "";

    let domain = authority.split(":")[0];

    let port = +authority.split(":")[1];
    if (!port) {
      port = scheme == "https" ? 443 : 80;
    }

    return {
      anchor,
      authority,
      domain,
      parameters,
      path,
      port,
      scheme,
    };
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Check if the content type(s) in question are accepted by the request.
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

    const matches = contentTypes.filter((contentType) => {
      return acceptHeader!.includes(contentType);
    });

    return matches.length > 0;
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
    const cookies: { [key: string]: string } = Drash.Deps.getCookies(
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
  ): Drash.Types.TRequestParams {
    if (!type) {
      return {
        body: this.#parsed_body,
        path: new URLSearchParams(this.#resource.path_parameters),
        query: new URLSearchParams(this.url.parameters),
      };
    }

    switch(type) {
      case "body":
        return this.#parsed_body;
      case "path":
        return new URLSearchParams(this.#resource.path_parameters);
      case "query":
        return new URLSearchParams(this.url.parameters);
      default:
        break;
    }
  }

  /**
   * Parse the specified request's body if there is a body.
   */
  public async parseBody(): Promise<void> {
    if (!this.has_body) {
      return;
    }

    let contentType = this.#original.headers.get(
      "Content-Type",
    );

    if (!contentType) {
      contentType = this.#original.headers.get(
        "content-type",
      );
    }

    // No Content-Type header? Default to parsing the request body as
    // aplication/x-www-form-urlencoded.
    if (!contentType) {
      this.#parsed_body = await this.parseBodyAsFormUrlEncoded(true);
      return;
    }

    if (contentType.includes("multipart/form-data")) {
      this.#parsed_body = await this.parseBodyAsMultipartFormData(
        contentType,
      );
      return;
    }

    if (contentType.includes("application/json")) {
      this.#parsed_body = await this.parseBodyAsJson();
      return;
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
      this.#parsed_body = await this.parseBodyAsFormUrlEncoded();
      return;
    }
  }

  /**
   * Parse the original request's body as application/x-www-form-url-encoded.
   *
   * @returns A `Promise` of an empty object if no body exists, else a key/value
   * pair array (e.g., `returnValue['someKey']`).
   */
  public async parseBodyAsFormUrlEncoded(
    parseByDefault: boolean = false,
  ): Promise<Drash.Interfaces.IKeyValuePairs<unknown>> {
    try {
      let body = Drash.Deps.decoder.decode(
        await Deno.readAll(this.#original.body),
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
  public async parseBodyAsJson(): Promise<{ [key: string]: unknown }> {
    try {
      let data = Drash.Deps.decoder.decode(
        await Deno.readAll(this.#original.body),
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
   * Parse the original request's body as multipart/form-data.
   *
   * @param body - The request's body.
   * @param boundary - The boundary of the part (e.g., `----------437192313`)
   * @param maxMemory - The maximum memory to allocate to this process in
   * megabytes.
   *
   * @return A Promise<MultipartFormData>.
   */
  public async parseBodyAsMultipartFormData(
    contentType: string,
  ): Promise<Drash.Deps.MultipartFormData> {
    let boundary: null | string = null;

    // Special thanks to https://github.com/artisonian for helping parse the
    // boundary logic below
    try {
      const match = contentType.match(/boundary=([^\s]+)/);
      if (match) {
        boundary = match[1];
      }
      if (!boundary) {
        throw new Drash.Errors.DrashError("D1004");
      }
    } catch (error) {
      throw new Drash.Errors.DrashError("D1004");
    }

    // Convert memory to megabytes for parsing multipart/form-data
    const maxMemory = 1024 * 1024 * this.#options.memory!.multipart_form_data!;

    try {
      const mr = new Drash.Deps.MultipartReader(this.#original.body, boundary);
      return await mr.readForm(maxMemory);
    } catch (error) {
      throw new Drash.Errors.DrashError("D1005");
    }
  }

  /**
   * Set the resource that is associated with this request on this request.
   */
  public setResource(resource: Drash.Resource): void {
    this.#resource = resource;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Validate the options and set them on this object.
   *
   * @param options
   */
  #setOptions(options: Drash.Interfaces.IRequestOptions): void {
    if (!options.original) {
      throw new Drash.Errors.DrashError("D1002");
    }

    if (!options.server) {
      throw new Drash.Errors.DrashError("D1003");
    }

    if (!options.memory) {
      options.memory = {
        multipart_form_data: 128,
      };
    }

    if (!options.memory.multipart_form_data) {
      options.memory.multipart_form_data = 128;
    }

    this.#options = options;
  }

  /**
   * Set the properties on this object.
   */
  #setProperties(): void {
    this.#server = this.#options.server!;
    this.#original = this.#options.original!;
  }
}
