import {
  Cookie,
  FormFile,
  MultipartReader,
  Response,
  ServerRequest,
  getCookies,
} from "../../deps.ts";
type Reader = Deno.Reader;
import { Drash } from "../../mod.ts";
const decoder = new TextDecoder();
const encoder = new TextEncoder();

interface OptionsConfig {
  default_response_content_type: string | undefined;
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
  public response_content_type: string = "application/json";
  protected original_request: ServerRequest;

  constructor(originalRequest: ServerRequest, options?: OptionsConfig) {
    super();
    this.headers = originalRequest.headers;
    this.method = originalRequest.method;
    this.original_request = originalRequest;
    this.url = originalRequest.url;
    this.url_path = this.getUrlPath(originalRequest);
    this.url_query_params = this.getUrlQueryParams(originalRequest);
  }

  /**
   * @description
   *     Checks if the incoming request accepts the type(s) in the parameter.
   *     This method will check if the requests `Accept` header contains
   *     the passed in types
   *
   * @param string|string[] type
   *     The content-type/mime-type(s) to check if the request accepts it
   *
   * @example
   *     // YourResource.ts - assume the request accepts "text/html"
   *     const isAccepted = this.request.accepts("text/html"); // "text/html"
   *     // or can also pass in an array and will match on the first one found
   *     const isAccepted = this.request.accepts(["text/html", "text/xml"]); // "text/html"
   *     // and will return false if not found
   *     const isAccepted = this.request.accepts("text/xml"); // false
   *
   * @return boolean|string
   *     False if the request doesn't accept any of the passed in types,
   *     or the content type that was matches
   */
  public accepts(type: string | string[]): boolean | string {
    const acceptHeader = this.headers.get("Accept");

    if (!acceptHeader) {
      return false;
    }

    // for when `type` is a string
    if (typeof type === "string") {
      return acceptHeader.indexOf(type) >= 0 ? type : false;
    }

    // for when `type` is an array
    const matches = type.filter((t) => acceptHeader.indexOf(t) >= 0);
    return matches.length ? matches[0] : false; // return first match
  }

  /**
   * @description
   *     Get a cookie value by the name that is sent in with the request
   * 
   * @param string cookie
   *     The name of the cookie to retrieve
   * 
   * @return string
   *     The cookie value associated with the cookie name or undefined
   *     if a cookie with that name doesn't exist
   */
  public getCookie(name: string): string {
    const cookies: { [key: string]: string } = getCookies(
      this.original_request,
    );
    return cookies[name];
  }

  /**
   * @description
   *     Parse this request's body as `multipart/form-data` and get the
   *     requested input.
   *
   * @param string input
   *     The filename of the file to get ??? (clarify).
   *
   * @return unknown
   */
  public getBodyFile(input: string): unknown {
    return this.parsed_body.data.value(input);
  }

  /**
   * @description
   *     Get the value of one of this request's body params by its input name.
   *     First, check the Content-Type of the request so that we know how to
   *     parse the body. Then parse the body accordingly and retrieve the
   *     requested value.
   *
   * @return string|undefined
   */
  public getBodyParam(input: string): string | undefined {
    return this.parsed_body.data[input];
  }

  /**
   * @description
   *     Get the value of one of this request's headers by its input name.
   *
   * @return string|null
   */
  public getHeaderParam(input: string): string | null {
    return this.headers.get(input);
  }

  /**
   * @description
   *     Get the value of one of this request's path params by its input name.
   *
   * @return string|undefined
   */
  public getPathParam(input: string): string | undefined {
    // request.path_params is set in Drash.Http.Server.getResourceClass()
    return this.path_params[input];
  }

  /**
   * @description
   *     Get the value of one of this request's query params by its input name.
   *
   * @return string|undefined
   */
  public getUrlQueryParam(input: string): string | undefined {
    return this.url_query_params[input];
  }

  /**
   * @description
   *     Get this request's URL path.
   *
   * @return string
   *     Returns the URL path.
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
   * @description
   *     Get the request's URL query params by parsing its URL query string.
   *
   * @return { {[key: string]: string} }
   *     Returns the URL query string in key-value pair format.
   */
  public getUrlQueryParams(
    serverRequest: ServerRequest,
  ): { [key: string]: string } {
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
   * @description
   *     Get the specified HTTP request's URL query string.
   *
   * @return null|string
   *     Returns the URL query string (e.g., key1=value1&key2=value2) without
   *     the leading "?" character.
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
   * @description
   *     Does the specified request have a body?
   *
   * @return Promise<boolean>
   *     Returns `true` if the request has a body. Returns `false` if not.
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
   * @description
   *     Parse the specified request's body.
   * 
   * @param OptionsConfig options
   * 
   * @returns {content_type: string, data: unknown}
   *     Returns the content type of the body, and based on this
   *     the body itself in that format. If there is no body, it
   *     returns an empty properties
   */
  public async parseBody(
    options?: OptionsConfig,
  ): Promise<Drash.Interfaces.ParsedRequestBody> {
    let ret: { content_type: string; data: unknown } = {
      content_type: "",
      data: undefined,
    };

    if (await this.hasBody() === false) {
      return ret;
    }

    const contentType = this.headers.get("Content-Type");

    // No Content-Type header? Default to this.
    if (!contentType) {
      try {
        ret.data = await this.parseBodyAsFormUrlEncoded();
        ret.content_type = "application/x-www-form-urlencoded";
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
          return ret;
        }
      } catch (error) {
        throw new Error(`Error trying to find boundary.\n` + error.stack);
      }
      try {
        let maxMemory: number = 10;
        if (
          options && options.memory_allocation &&
          options.memory_allocation.multipart_form_data &&
          options.memory_allocation.multipart_form_data > 10
        ) {
          maxMemory = options.memory_allocation.multipart_form_data;
        }
        ret.data = await this.parseBodyAsMultipartFormData(
          this.original_request.body,
          boundary,
          maxMemory,
        );
        ret.content_type = "multipart/form-data";
      } catch (error) {
        throw new Error(
          `Error reading request body as multipart/form-data.`,
        );
      }
    }

    if (contentType && contentType.includes("application/json")) {
      try {
        ret.data = await this.parseBodyAsJson();
        ret.content_type = "application/json";
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
        ret.data = await this.parseBodyAsFormUrlEncoded();
        ret.content_type = "application/x-www-form-urlencoded";
      } catch (error) {
        throw new Error(
          `Error reading request body as application/x-www-form-urlencoded.`,
        );
      }
    }

    this.parsed_body = ret;
    return this.parsed_body;
  }

  /**
   * @description
   *    Parse this request's body as application/x-www-form-url-encoded.
   *
   * @return Promise<object|Array<>>
   *    Returns an empty object if no body exists, else a key/value pair
   *    array e.g. returnValue['someKey']
   */
  public async parseBodyAsFormUrlEncoded(): Promise<object | Array<unknown>> {
    let body = decoder.decode(await Deno.readAll(this.original_request.body));
    if (body.indexOf("?") !== -1) {
      body = body.split("?")[1];
    }
    body = body.replace(/\"/g, "");
    return Drash.Services.StringService.parseQueryParamsString(body);
  }

  /**
   * @description
   *    Parse this request's body as application/json.
   *
   * @return Promise<object>
   *    JSON object - the decoded request body
   */
  public async parseBodyAsJson(): Promise<object> {
    const data = decoder.decode(await Deno.readAll(this.original_request.body));
    return JSON.parse(data);
  }

  /**
   * @description
   *    Parse this request's body as multipart/form-data.
   *
   * @param Reader body
   *     The request's body.
   * @param string boundary
   *     The boundary of the part (e.g., `----------437192313`)
   * @param number maxMemory
   *     The maximum memory to allocate to this process in megabytes.
   *
   * @return Promise<{ [key: string]: string | FormFile }>
   *     Returned values can be seen here (look for `readForm`:
   *     https://deno.land/std@v0.32.0/mime/multipart.ts
   */
  public async parseBodyAsMultipartFormData(
    body: Reader,
    boundary: string,
    maxMemory: number,
  ): Promise<unknown> {
    // Convert memory to megabytes for parsing multipart/form-data. Also,
    // default to 128 megabytes if memory allocation wasn't specified.
    if (!maxMemory) {
      maxMemory = 1024 * 1024 * 128;
    } else {
      maxMemory *= 1024 * 1024;
    }
    const mr = await new MultipartReader(body, boundary);
    const ret = await mr.readForm(maxMemory);
    // console.log(ret);
    return ret;
  }

  /**
   * @description
   *     Set headers on the request.
   *
   * @param {[key: string]: string }  headers
   * 
   * @return void
   */
  public setHeaders(headers: { [key: string]: string }): void {
    if (headers) {
      for (let key in headers) {
        this.headers.set(key, headers[key]);
      }
    }
  }

  public async respond(r: Response): Promise<void> {
    this.original_request.respond(r);
  }
}
