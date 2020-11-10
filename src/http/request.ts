import {
  decoder,
  FormFile,
  getCookies,
  MultipartFormData,
  MultipartReader,
  ServerRequest,
} from "../../deps.ts";
type Reader = Deno.Reader;
import { Drash } from "../../mod.ts";

export interface IOptions {
  headers?: Headers;
  memory_allocation: {
    multipart_form_data: number;
  };
}

export class Request extends ServerRequest {
  public parsed_body: Drash.Interfaces.ParsedRequestBody = {
    content_type: "",
    data: undefined,
  };
  public path_params: { [key: string]: string } = {};
  public url_query_params: { [key: string]: string } = {};
  public url_path: string;
  public resource: Drash.Http.Resource | null = null;
  protected original_request: ServerRequest;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
     * Construct an object of this class.
     *
     * @param ServerRequest - originalRequest
     *     The original Deno ServerRequest object that's used to help create this
     *     Drash.Http.Request object. There are some data members that the
     *     original request has that can't be attached to this object. Therefore,
     *     we keep track of the original request if we ever want to access data
     *     members from it. An example of a data member that we want to access is
     *     the original request's body.
     * @param IOptions - options to be used in the server
     */
  constructor(originalRequest: ServerRequest, options?: IOptions) {
    super();
    this.headers = originalRequest.headers;
    this.method = originalRequest.method;
    this.original_request = originalRequest;
    this.url = originalRequest.url;
    this.url_path = this.getUrlPath(originalRequest);
    this.url_query_params = this.getUrlQueryParams();
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
  public accepts(type: string | string[]): boolean | string {
    return new Drash.Services.HttpService().accepts(this, type);
  }

  /**
   * Gets all the body params
   *
   * @return The parsed body as an object
   */
  public getAllBodyParams(): Drash.Interfaces.ParsedRequestBody {
    return this.parsed_body;
  }

  /**
   * Gets all header params
   *
   * @return Key value pairs for the header name and it's value
   */
  public getAllHeaderParams(): { [key: string]: string } {
    let headers: { [key: string]: string } = {};
    for (const pair of this.headers.entries()) {
      headers[pair[0]] = pair[1];
    }
    return headers;
  }

  /**
   * Get all the path params.
   *
   * @return A key-value pair object where the key is the param name and the
   * value is the param value.
   */
  public getAllPathParams(): { [key: string]: string } {
    return this.path_params;
  }

  /**
   * Gets a record whose keys are the request's url query params specified by inputs
   * and whose values are the corresponding values of the query params.
   * 
   * @returns Key value pairs of the query param and its value. Empty object if no query params
   */
  public getAllUrlQueryParams(): { [key: string]: string } {
    return this.url_query_params;
  }

  /**
   * Get the requested file from the body of a multipart/form-data request, by
   * it's name.
   *
   * @param input - The name of the file to get.
   *
   * @return The file requested or `undefined` if not available.
   */
  public getBodyFile(input: string): FormFile | undefined {
    if (typeof this.parsed_body.data!.file === "function") {
      const file = this.parsed_body.data!.file(input);
      // `file` can be of types: FormFile | FormFile[] | undefined.
      // Below, we get pass the TSC error of this not being of
      // type `FormFile | undefined`
      if (Array.isArray(file)) {
        return file[0];
      }
      return file;
    }
    return undefined;
  }

  /**
   * Get the value of one of this request's body params by its input name.
   *
   * @returns The corresponding parameter or null if not found
   */
  public getBodyParam(
    input: string,
  ): string | { [key: string]: unknown } | Array<unknown> | boolean | null {
    let param;
    if (typeof this.parsed_body.data!.value === "function") {
      // For when multipart/form-data
      param = this.parsed_body.data!.value(input);
    } else {
      // Anything else. Note we need to use `as` here, to convert it
      // to an object, otherwise it's type is `MultipartFormData | ...`,
      // and typescript did not like us indexing.
      param = (this.parsed_body.data as { [k: string]: unknown })[input];
    }
    if (param || typeof param === "boolean") {
      return param;
    }
    return null;
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
    const cookies: { [key: string]: string } = getCookies(
      this.original_request,
    );
    return cookies[name];
  }

  /**
   * Get the value of one of this request's headers by its input name.
   *
   * @returns The corresponding header or null if not found.
   */
  public getHeaderParam(input: string): string | null {
    return this.headers.get(input);
  }

  /**
   * Get the value of one of this request's path params by its input name.
   *
   * @returns The corresponding path parameter or null if not found.
   */
  public getPathParam(input: string): string | null {
    // request.path_params is set in Drash.Http.Server.getResourceClass()
    let param = this.path_params[input];
    if (param) {
      return param;
    }
    return null;
  }

  /**
   * Get this request's URL path.
   *
   * @returns The URL path.
   */
  public getUrlPath(serverRequest: ServerRequest): string {
    let path = serverRequest.url;

    if (path == "/") {
      return path;
    }

    if (path.indexOf("?") == -1) {
      return path;
    }

    try {
      path = path.split("?")[0];
    } catch (error) {
      // ha.. do nothing
    }

    return path;
  }

  /**
   * Get the value of one of this request's query params by its input name.
   *
   * @returns The corresponding query parameter from url or null if not found.
   */
  public getUrlQueryParam(input: string): string | null {
    const param = this.url_query_params[input];
    if (param) {
      return param;
    }
    return null;
  }

  /**
   * Get the request's URL query params by parsing its URL query string.
   *
   * @return The URL query string in key-value pair format.
   *
   * ```ts
   * {[key: string]: string}
   * ```
   */
  private getUrlQueryParams(): { [key: string]: string } {
    let queryParams: { [key: string]: string } = {};

    try {
      let queryParamsString = this.getUrlQueryString();
      if (!queryParamsString) {
        queryParamsString = "";
      }
      queryParams = Drash.Services.StringService.parseQueryParamsString(
        queryParamsString,
      );
    } catch (error) {
      // Do absofruitly nothing
    }

    return queryParams;
  }

  /**
   * Get the specified HTTP request's URL query string.
   *
   * @returns The URL query string (e.g., key1=value1&key2=value2) without the
   * leading "?" character. Could be null if not available
   */
  public getUrlQueryString(): null | string {
    let queryString = null;

    if (this.url.indexOf("?") == -1) {
      return queryString;
    }

    try {
      queryString = this.url.split("?")[1];
    } catch (error) {
      // ha.. do nothing
    }

    return queryString;
  }

  /**
   * Does the specified request have a body?
   *
   * @returns A boolean `Promise`. `true` if the request has a body, `false` if
   * not.
   */
  public async hasBody(): Promise<boolean> {
    let contentLength = this.headers.get("content-length");

    if (!contentLength) {
      contentLength = this.headers.get("Content-Length");
    }

    if (!contentLength) {
      return false;
    }

    return parseInt(contentLength) > 0;
  }

  /**
   * Parse the specified request's body.
   *
   * @param options - See IOptions.
   *
   * @returns The content type of the body, and based on this the body itself in
   * that format. If there is no body, it returns an empty properties
   */
  public async parseBody(
    options?: IOptions,
  ): Promise<Drash.Interfaces.ParsedRequestBody> {
    if ((await this.hasBody()) === false) {
      return {
        content_type: "",
        data: undefined,
      };
    }

    const contentType = this.headers.get("Content-Type");

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
        let maxMemory: number = 10;
        if (
          options &&
          options.memory_allocation &&
          options.memory_allocation.multipart_form_data &&
          options.memory_allocation.multipart_form_data > 10
        ) {
          maxMemory = options.memory_allocation.multipart_form_data;
        }
        const ret = {
          data: await this.parseBodyAsMultipartFormData(
            this.original_request.body,
            boundary,
            maxMemory,
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
          `Error reading request body as application/json.`,
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
   * Parse this request's body as application/x-www-form-url-encoded.
   *
   * @returns A `Promise` of an empty object if no body exists, else a key/value
   * pair array (e.g., `returnValue['someKey']`).
   */
  public async parseBodyAsFormUrlEncoded(): Promise<
    { [key: string]: unknown }
  > {
    let body = decoder.decode(
      await Deno.readAll(this.original_request.body),
    );
    if (body.indexOf("?") !== -1) {
      body = body.split("?")[1];
    }
    body = body.replace(/\"/g, "");
    return Drash.Services.StringService.parseQueryParamsString(body);
  }

  /**
   * Parse this request's body as application/json.
   *
   * @returns A `Promise` of a JSON object decoded from request body.
   */
  public async parseBodyAsJson(): Promise<{ [key: string]: unknown }> {
    const data = decoder.decode(
      await Deno.readAll(this.original_request.body),
    );
    return JSON.parse(data);
  }

  /**
   * Parse this request's body as multipart/form-data.
   *
   * @param body - The request's body.
   * @param boundary - The boundary of the part (e.g., `----------437192313`)
   * @param maxMemory - The maximum memory to allocate to this process in
   * megabytes.
   *
   * @return A Promise<MultipartFormData>.
   */
  public async parseBodyAsMultipartFormData(
    body: Reader,
    boundary: string,
    maxMemory: number,
  ): Promise<MultipartFormData> {
    // Convert memory to megabytes for parsing multipart/form-data. Also,
    // default to 128 megabytes if memory allocation wasn't specified.
    if (!maxMemory) {
      maxMemory = 1024 * 1024 * 128;
    } else {
      maxMemory *= 1024 * 1024;
    }
    const mr = new MultipartReader(body, boundary);
    const ret = await mr.readForm(maxMemory);
    // console.log(ret);
    return ret;
  }

  /**
   * Respond the the client's request by using the original request's
   * `respond()` method.
   *
   * @param output - The data to respond with.
   */
  public async respond(
    output: Drash.Interfaces.ResponseOutput,
  ): Promise<void> {
    this.original_request.respond(output);
  }

  /**
   * Set headers on the request.
   *
   * @param headers - Headers in the form of `{[key: string]: string}`.
   */
  public setHeaders(headers: { [key: string]: string }): void {
    if (headers) {
      for (let key in headers) {
        this.headers.set(key, headers[key]);
      }
    }
  }
}
