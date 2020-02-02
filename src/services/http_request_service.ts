import {
  MultipartReader,
  ServerRequest,
  contentType,
} from "../../deps.ts";
import StringService from "./string_service.ts";
const decoder = new TextDecoder();
const encoder = new TextEncoder();

/**
 * @memberof Drash.Services
 * @class HttpRequestService
 *
 * @description
 *     This class helps perform HTTP request related processes.
 */
export default class HttpRequestService {

  protected request: any;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(request: any, options?: any) {
    this.request = request;

    if (options.headers) {
      this.setHeaders(options.headers);
    }

    // Attach properties
    this.request.has_parsed_body = false;
    this.request.parsed_body = undefined;
    this.request.url_path = this.getUrlPath();
    this.request.url_query_params = this.getUrlQueryParams(request);

    // Attach methods
    this.request.getBodyFile = async (file, maxMemory) => {
      return await this.getBodyFile(this.request, file, maxMemory);
    }
    this.request.getBodyParam = async (input) => {
      return await this.getBodyParam(input);
    }
    this.request.getHeaderParam = async (input) => {
      return await this.getHeaderParam;
    }
    this.request.getPathParam = async (input) => {
      return await this.getPathParam;
    }
    this.request.getQueryParam = async (input) => {
      return await this.getQueryParam;
    }

    this.setResponseContentType(options.default_response_content_type);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC //////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Get the request object.
   *
   * @return any
   */
   public getRequest(): any {
     return this.request;
   }

  /**
   * @description
   *     Get the request's URL query params by parsing its URL query string.
   *
   * @param any request
   *     The request object.
   *
   * @return any
   *     Returns the URL query string in key-value pair format.
   */
  public getUrlQueryParams(request: any): any {
    let queryParams = {};

    try {
      let queryParamsString = request.url.split("?")[1];
      queryParams = StringService.parseQueryParamsString(queryParamsString);
    } catch (error) {}

    return queryParams;
  }

  /**
   * @description
   *     Parse this request's body as `multipart/form-data` and get the
   *     requested input.
   *
   * @param string file
   *     The file to get by its name.
   * @param number maxMemory
   *     The max memory to allocate for this process. Defaults to 1MB.
   *
   * @return Promise<any>
   *     Returns a body as a parsable JSON object where the first level of keys
   *     are the names of the parts. For example, if the name of the first part
   *     is `file_number_one`, then it will be accessible in the returned object
   *     as `{returned_object}.file_number_one`.
   */
  public async getBodyFile(
    request: any,
    file: string,
    maxMemory: number = 1024 * 1024
  ): Promise<any> {
    const contentType = request.headers.get("Content-Type");

    if (
      !contentType
      || !contentType.includes("multipart/form-data")
    ) {
      throw new Error(
        `Cannot read request Content-Type of ${contentType}. `
        + `When using \`getBodyFile()\`, the only allowed type is `
        + `\`multipart/form-data\`.`
      );
    }

    if (!request.has_parsed_body) {
      try {
        request.parsed_body = await this.parseBodyAsMultipartFormData(
          request,
          maxMemory
        );
        request.has_parsed_body = true;
      } catch (error) {
        throw new Error(
          `Error reading request body as multipart/form-data.\n`
          + error.stack
        );
      }
    }

    return request.parsed_body[file];
  }

  /**
   * @description
   *     Get the value of one of this request's body params by its input name.
   *     First, check the Content-Type of the request so that we know how to
   *     parse the body. Then parse the body accordingly and retrieve the
   *     requested value.
   *
   * @return any
   */
  public getBodyParam(input: string): any {
    const contentType = this.request.headers.get("Content-Type");
    if (
      !contentType
      || (
        !contentType.includes("application/json")
        && !contentType.includes("application/x-www-form-urlencoded")
      )
    ) {
      throw new Error(
        `Cannot read request Content-Type of ${contentType}. `
        + `When using \`getBodyParam()\`, the only allowed types are `
        + `\`application/json\` and \`application/x-www-form-urlencoded\`.`
      );
    }

    if (this.request.headers.get("Content-Type").includes("application/json")) {
      try {
        this.request.parsed_body = this.parseBodyAsJson();
        this.request.has_parsed_body = true;
        this.request.parsed_body[input];
      } catch (error) {
        throw new Error(
          `Error reading request body as application/json.\n`
          + error.stack
        );
      }
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
      try {
        this.request.parsed_body = this.parseBodyAsFormUrlEncoded();
        this.request.has_parsed_body = true;
        this.request.parsed_body[input];
      } catch (error) {
        throw new Error(
          `Error reading request body as application/x-www-form-urlencoded.\n`
          + error.stack
        );
      }
    }

    try {
      this.request.parsed_body = this.parseBodyAsFormUrlEncoded();
      this.request.has_parsed_body = true;
      this.request.parsed_body[input];
    } catch (error) {
      throw new Error(
        `Error reading request body. No Content-Type header was specified. `
        + `Therefore, the body was parsed as application/x-www-form-urlencoded `
        + `and failed.\n` + error.stack
      );
    }
  }

  /**
   * @description
   *     Get the value of one of this request's headers by its input name.
   *
   * @return string
   */
  public getHeaderParam(input: string): any {
    return this.request.headers.get(input);
  }

  /**
   * @description
   *     Get the value of one of this request's path params by its input name.
   *
   * @return string
   */
  public getPathParam(input: string): string {
    return this.request.path_params[input];
  }

  /**
   * @description
   *     Get the value of one of this request's query params by its input name.
   *
   * @return string
   */
  public getQueryParam(input: string): any {
    return this.request.url_query_params[input];
  };

  /**
   * @description
   *     Get this request's URL path.
   *
   * @return string
   *     Returns the URL path.
   */
  public getUrlPath(): string {
    let path = this.request.url;

    if (path == "/") {
      return path;
    }

    if (this.request.url.indexOf("?") == -1) {
      return path;
    }

    try {
      path = this.request.url.split("?")[0];
    } catch (error) {
      // ha.. do nothing
    }

    return path;
  }

  /**
   * @description
   *     Get the specified HTTP request's URL query string.
   *
   * @return string
   *     Returns the URL query string (e.g., key1=value1&key2=value2) without
   *     the leading "?" character.
   */
  public getUrlQueryString(): string {
    let queryString = null;

    if (this.request.url.indexOf("?") == -1) {
      return queryString;
    }

    try {
      queryString = this.request.url.split("?")[1];
    } catch (error) {
      // ha.. do nothing
    }

    return queryString;
  }

  /**
   * @description
   *     Does the specified request have a body?
   *
   * @return boolean
   *     Returns `true` if the request has a body. Returns `false` if not.
   */
  public hasBody(): boolean {
    return parseInt(this.request.headers.get("content-length")) > 0;
  }

  /**
   * @description
   *    Parse this request's body as application/x-www-form-url-encoded.
   *
   * @return any
   */
  public async parseBodyAsFormUrlEncoded() {
    let body = decoder.decode(await Deno.readAll(this.request.body));
    if (body.indexOf("?") !== -1) {
      body = body.split("?")[1];
    }
    return StringService.parseQueryParamsString(body);
  }

  /**
   * @description
   *    Parse this request's body as application/json.
   *
   * @return any
   */
  public async parseBodyAsJson() {
    let body = decoder.decode(await Deno.readAll(this.request.body));
    return JSON.parse(body);
  }

  /**
   * @description
   *    Parse this request's body as multipart/form-data.
   *
   * @return any
   */
  public async parseBodyAsMultipartFormData(
    request: any,
    maxMemory: number
  ) {
    const contentType = request.headers.get("content-type");
    const boundary = contentType.match(/boundary=([^\s]+)/)[1];
    const mr = await new MultipartReader(request.body, boundary);
    return await mr.readForm(maxMemory);
  }

  /**
   * @description
   *     Set headers on the request.
   *
   * @param any request
   * @param any headers
   */
  public setHeaders(headers: any) {
    if (headers) {
      for (let key in headers) {
        this.request.headers.set(key, headers[key]);
      }
    }
  }

  /**
   * @description
   *     Set the request's requested content type.
   *
   *     There are three ways to set this value: (1) the request's headers by
   *     setting `Response-Content-Type: "type"`, (2) the request's URL query
   *     params by setting `?response_content_type=type`, and the request's body
   *     by setting `{response_content_type: "type"}`.
   *
   *     The request's body takes precedence over all other settings.
   *
   *     The request's URL query params takes precedence over the header setting
   *     and the default setting.
   *
   *     The request's header setting takes precedence over the default setting.
   *
   *     If no content type is specified by the request's body, URL query
   *     params, or header, then the default content type will be used. The
   *     default content type is the content type defined in the
   *     `Drash.Http.Server` object's `response_output` config. If a default is
   *     not specified, then "application/json" will be used.
   */
  public setResponseContentType(defaultContentType: string = "application/json"): void {
    // Better not be null...
    defaultContentType = defaultContentType
      ? defaultContentType
      : "application/json";

    let contentType = null;

    // Check the request's headers to see if `response-content-type:
    // {content-type}` has been specified
    contentType = this.request.headers.get("Response-Content-Type")
      ? this.request.headers.get("Response-Content-Type")
      : contentType;

    // Check the request's URL query params to see if
    // ?response_content_type={content-type} has been specified
    contentType = this.request.url_query_params.response_content_type
      ? this.request.url_query_params.response_content_type
      : contentType;

    // Check the request's body to see if
    // {response_content_type: {content-type}} has been specified
    contentType = this.request.parsed_body && this.request.parsed_body.response_content_type
      ? this.request.parsed_body.response_content_type
      : contentType;

    if (!contentType) {
      contentType = defaultContentType;
    }

    this.request.response_content_type = contentType;
  }
}
