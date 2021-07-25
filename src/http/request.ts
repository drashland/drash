import * as Drash from "../../mod.ts";

export class Request
implements Drash.Interfaces.IProxy<Drash.Deps.ServerRequest> {
  public parsed_body: Drash.Interfaces.IRequestParsedBody = {};

  // @ts-ignore
  public options: Drash.Interfaces.IRequestOptions;

  // @ts-ignore
  public request: ServerRequest;

  // @ts-ignore
  public server: Drash.Server;

  public path_params: URLSearchParams = new URLSearchParams();

  // @ts-ignore
  public original: Drash.Deps.ServerRequest;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public create(options: Drash.Interfaces.IRequestOptions): void {
    this.options = options;
    this.validateOptions();
    this.setProperties();
  }

  protected setProperties(): void {
    this.server = this.options.server!;
    this.original = this.options.original!;
  }

  public validateOptions(): void {
    if (!this.options.original) {
      throw new Drash.Errors.DrashError("D1002");
    }

    if (!this.options.server) {
      throw new Drash.Errors.DrashError("D1003");
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - GETTERS AND SETTERS /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  get body(): Deno.Reader {
    return this.original.body;
  }

  get has_body(): boolean {
    let contentLength = this.original.headers.get("content-length");

    if (!contentLength) {
      contentLength = this.original.headers.get("Content-Length");
    }

    if (!contentLength) {
      return false;
    }

    return +contentLength > 0;
  }

  get method(): string {
    return this.original.method;
  }

  get #original(): Drash.Deps.ServerRequest {
    return this.options.original!;
  }

  get url(): Drash.Interfaces.IRequestUrl {
    const anchorSplit = this.original.url.includes("#")
      ? this.original.url.split("#")
      : null;
    const anchor = anchorSplit
      ? anchorSplit[anchorSplit.length - 1]
      : undefined;

    const parametersSplit = this.original.url.includes("?")
      ? this.original.url.split("?")[1]
      : null;
    const parameters = parametersSplit
      ? parametersSplit.split("#").join("")
      : undefined;

    const path = this.original.url.split("?")[0];

    const scheme = this.server.options.protocol!;

    let authority = this.original.headers.get("host") ?? "";

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
   * Used to check which headers are accepted.
   *
   * @param type - It is either a string or an array of strings that contains
   * the Accept Headers.
   * @returns Either true or the string of the correct header.
   */
  public accepts(contentTypes: string[]): boolean {
    let acceptHeader = this.original.headers.get("Accept");

    if (!acceptHeader) {
      acceptHeader = this.original.headers.get("accept");
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
   * Set the `request.path_params` property after finding the given resource so
   * the user can access them via `this.original.getPathParamValue()`.
   *
   * How it works: If we have the following request URI ...
   *
   *     /hello/world/i-love-you
   *
   * and it was matched to a resource with the following URI ...
   *
   *    /hello/:thing/:greeting
   *
   * then we end up with two arrays ...
   *
   *     resource's defined path params: [ "thing", "greeting" ]
   *     request's given path params:    [ "world", "i-love-you" ]
   *
   * that get merged merged into key-value pairs ...
   *
   *     { thing: "world", greeting: "i-love-you" }
   *
   * The first array serves as the keys and the second array serves the value of
   * the keys.
   *
   * @param resource - The resource object.
   */
  public setPathParams(
    resource: Drash.Interfaces.IResource,
  ): void {
    let params = "";

    resource.uri_paths_parsed.forEach(
      (pathObj: Drash.Interfaces.IResourcePathsParsed) => {
        pathObj.params.forEach((paramName: string, index: number) => {
          params += `${paramName}=${resource.path_params[index]}`;
        });
      },
    );

    this.path_params = new URLSearchParams(params);
  }

  /**
   * Get the requested file from the body of a multipart/form-data request, by
   * it's name.
   *
   * @param input - The name of the file to get.
   *
   * @return The file requested or `undefined` if not available.
   */
  public async getBodyFile(input: string): Promise<void> {
    if (!this.has_body) {
      return;
    }

    const body = await this.parseBody();
  }

  /**
   * Get a MIME type for a file based on its extension.
   *
   * @param filePath - The file path in question.
   * @param fileIsUrl - (optional) Is the file path  a URL to a file? Defaults
   * to false.  If the file path is a URL, then this method will make sure the
   * URL query string is not included while doing a lookup of the file's
   * extension.
   *
   * @returns The name of the MIME type based on the extension of the file path
   * .
   */
  public getMimeType(
    filePath: string | undefined,
    fileIsUrl: boolean = false,
  ): null | string {
    let mimeType = null;

    if (fileIsUrl) {
      filePath = filePath ? filePath.split("?")[0] : undefined;
    }

    if (filePath) {
      let fileParts = filePath.split(".");
      filePath = fileParts.pop();

      for (let key in Drash.MimeDb) {
        if (!mimeType) {
          const extensions = Drash.MimeDb[key].extensions;
          if (extensions) {
            extensions.forEach((extension: string) => {
              if (filePath == extension) {
                mimeType = key;
              }
            });
          }
        }
      }
    }

    return mimeType;
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
    const cookies: { [key: string]: string } = Drash.Deps.getCookies(
      this.original,
    );
    return cookies[name];
  }

  /**
   * Parse the specified request's body.
   *
   * @param options - See IOptions.
   *
   * @returns The content type of the body, and based on this the body itself in
   * that format. If there is no body, it returns an empty properties
   */
  public async parseBody(): Promise<Drash.Interfaces.IRequestParsedBody> {
    const contentType = this.original.headers.get(
      "Content-Type",
    );

    // No Content-Type header? Default to this.
    if (!contentType) {
      try {
        const ret = {
          data: await this.parseBodyAsFormUrlEncoded(),
          content_type: "application/x-www-form-urlencoded",
        };
        this.parsed_body = ret;
        return this.parsed_body;
      } catch (error) {
        throw new Error(
          `Error reading request body. No Content-Type header was specified. ` +
            `Therefore, the body was parsed as application/x-www-form-urlencoded ` +
            `by default and failed.`,
        );
      }
    }

    // I want to thank https://github.com/artisonian for pointing me in the
    // right direction with using the logic below correctly. I was HELLA using
    // it incorrectly and couldn't parse a multipart/form-data body. Out of
    // frustration, I filed an issue on deno about my findings; and artisonian
    // gave an example of a working copy. Great work. Thank you!
    if (contentType && contentType.includes("multipart/form-data")) {
      let boundary: null | string = null;
      try {
        const match = contentType.match(/boundary=([^\s]+)/);
        if (match) {
          boundary = match[1];
        }
        if (!boundary) {
          return {
            content_type: "",
            data: undefined,
          };
        }
      } catch (error) {
        throw new Error(
          `Error trying to find boundary.\n` + error.stack,
        );
      }
      try {
        const ret = {
          data: await this.parseBodyAsMultipartFormData(
            this.original.body,
            boundary,
            this.options!.memory!.multipart_form_data!,
          ),
          content_type: "multipart/form-data",
        };
        this.parsed_body = ret;
        return this.parsed_body;
      } catch (error) {
        throw new Error(
          `Error reading request body as multipart/form-data.`,
        );
      }
    }

    if (contentType && contentType.includes("application/json")) {
      try {
        const ret = {
          data: await this.parseBodyAsJson(),
          content_type: "application/json",
        };
        this.parsed_body = ret;
        return this.parsed_body;
      } catch (error) {
        throw new Error(
          `Error reading request body as application/json. ${error.message}`,
        );
      }
    }

    if (
      contentType &&
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      try {
        const ret = {
          data: await this.parseBodyAsFormUrlEncoded(),
          content_type: "application/x-www-form-urlencoded",
        };
        this.parsed_body = ret;
        return this.parsed_body;
      } catch (error) {
        throw new Error(
          `Error reading request body as application/x-www-form-urlencoded.`,
        );
      }
    }

    return {
      content_type: "",
      data: undefined,
    };
  }

  /**
   * Parse this.original's body as application/x-www-form-url-encoded.
   *
   * @returns A `Promise` of an empty object if no body exists, else a key/value
   * pair array (e.g., `returnValue['someKey']`).
   */
  public async parseBodyAsFormUrlEncoded(): Promise<
    { [key: string]: unknown }
  > {
    let body = Drash.Deps.decoder.decode(
      await Deno.readAll(this.original.body),
    );
    if (body.indexOf("?") !== -1) {
      body = body.split("?")[1];
    }
    body = body.replace(/\"/g, "");
    return {};
  }

  /**
   * Parse this.original's body as application/json.
   *
   * @returns A `Promise` of a JSON object decoded from request body.
   */
  public async parseBodyAsJson(): Promise<{ [key: string]: unknown }> {
    let data = Drash.Deps.decoder.decode(
      await Deno.readAll(this.original.body),
    );

    // Check if the JSON string contains ' instead of ". We need to convert
    // those so we can call JSON.parse().
    if (data.match(/'/g)) {
      data = data.replace(/'/g, `"`);
    }

    return JSON.parse(data);
  }

  /**
   * Parse this.original's body as multipart/form-data.
   *
   * @param body - The request's body.
   * @param boundary - The boundary of the part (e.g., `----------437192313`)
   * @param maxMemory - The maximum memory to allocate to this process in
   * megabytes.
   *
   * @return A Promise<MultipartFormData>.
   */
  public async parseBodyAsMultipartFormData(
    body: Deno.Reader,
    boundary: string,
    maxMemory: number,
  ): Promise<Drash.Deps.MultipartFormData> {
    // Convert memory to megabytes for parsing multipart/form-data. Also,
    // default to 128 megabytes if memory allocation wasn't specified.
    if (!maxMemory) {
      maxMemory = 1024 * 1024 * 128;
    } else {
      maxMemory *= 1024 * 1024;
    }
    const mr = new Drash.Deps.MultipartReader(body, boundary);
    const ret = await mr.readForm(maxMemory);
    // console.log(ret);
    return ret;
  }
}
