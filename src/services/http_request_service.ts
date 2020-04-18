import { Drash } from "../../mod.ts";
import {
  FormFile,
  MultipartReader,
  ServerRequest,
} from "../../deps.ts";
import { getCookies, Cookie } from "../../deps.ts";
type Reader = Deno.Reader;
const decoder = new TextDecoder();
const encoder = new TextEncoder();

interface OptionsConfig {
  default_response_content_type?: string;
  memory_allocation?: { multipart_form_data?: number };
  headers?: any;
}

/**
 * @memberof Drash.Services
 * @class HttpRequestService
 *
 * @description
 *     This class helps perform HTTP request related processes.
 */
export class HttpRequestService {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC //////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

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
  public accepts(request: any, type: string | string[]): boolean | string {
    const acceptHeader = request.headers.get("Accept");

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
  public getCookie(request: any, name: string): string {
    const cookies: { [key: string]: string } = getCookies(request);
    return cookies[name];
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
   * @return any
   *     Returns a body as a parsable JSON object where the first level of keys
   *     are the names of the parts. For example, if the name of the first part
   *     is `file_number_one`, then it will be accessible in the returned object
   *     as `{returned_object}.file_number_one`.
   */
  public getRequestBodyFile(
    parsedBody: Drash.Interfaces.ParsedRequestBody,
    input: string,
  ): any {
    return parsedBody.data.value(input);
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
  public getRequestBodyParam(
    parsedBody: Drash.Interfaces.ParsedRequestBody,
    input: string,
  ): any {
    return parsedBody.data[input];
  }

  /**
   * @description
   *     Get the value of one of this request's headers by its input name.
   *
   * @return string
   */
  public getRequestHeaderParam(request: any, input: string): string {
    return request.headers.get(input);
  }

  /**
   * @description
   *     Get the value of one of this request's path params by its input name.
   *
   * @return string
   */
  public getRequestPathParam(request: any, input: string): string {
    // request.path_params is set in Drash.Http.Server.getResourceClass()
    return request.path_params[input];
  }

  /**
   * @description
   *     Get the value of one of this request's query params by its input name.
   *
   * @return string
   */
  public getRequestUrlQueryParam(request: any, input: string): string {
    return request.url_query_params[input];
  }

  /**
   * @description
   *     Get the request's requested content type.
   *
   *     There are three ways to get this value: (1) the request's headers by
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
  public getResponseContentType(
    request: any,
    defaultContentType: string = "application/json",
  ): string {
    // application/json will be used for any falsy defaultContentType argument
    defaultContentType = defaultContentType
      ? defaultContentType
      : "application/json";

    let contentType: null | string = null;

    // Check the request's headers to see if `response-content-type:
    // {content-type}` has been specified
    contentType = request.headers.get("Response-Content-Type")
      ? request.headers.get("Response-Content-Type")
      : contentType;

    // Check the request's URL query params to see if
    // ?response_content_type={content-type} has been specified
    contentType = request.url_query_params.response_content_type
      ? request.url_query_params.response_content_type
      : contentType;

    // Check the request's body to see if
    // {response_content_type: {content-type}} has been specified
    contentType =
      request.parsed_body && request.parsed_body.response_content_type
        ? request.parsed_body.response_content_type
        : contentType;

    if (!contentType) {
      contentType = defaultContentType;
    }

    return contentType;
  }

  /**
   * @description
   *     Get this request's URL path.
   *
   * @return string
   *     Returns the URL path.
   */
  public getUrlPath(request: any): string {
    let path = request.url;

    if (path == "/") {
      return path;
    }

    if (request.url.indexOf("?") == -1) {
      return path;
    }

    try {
      path = request.url.split("?")[0];
    } catch (error) {
      // ha.. do nothing
    }

    return path;
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
    let queryParams: any = {};

    try {
      let queryParamsString: null | string = this.getUrlQueryString(request);
      if (!queryParamsString) {
        queryParamsString = "";
      }
      queryParams = Drash.Services.StringService.parseQueryParamsString(
        queryParamsString,
      );
    } catch (error) {}

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
  public getUrlQueryString(request: any): null | string {
    let queryString = null;

    if (request.url.indexOf("?") == -1) {
      return queryString;
    }

    try {
      queryString = request.url.split("?")[1];
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
  public async hasBody(request: any): Promise<boolean> {
    let ret = parseInt(request.headers.get("content-length")) > 0;
    if (!ret) {
      ret = parseInt(request.headers.get("Content-Length")) > 0;
    }
    return ret;
  }

  /**
   * @description
   *     Hydrate the specified request object.
   *
   * @return Promise<boolean>
   *     Returns a hydrated request object. For example, deno uses the
   *     `ServerRequest` object. This method takes that object and adds more
   *     porperties and methods to it. This makes it easier for Drash to process
   *     the object for its own purposes.
   */
  public async hydrate(
    request: any,
    options?: OptionsConfig,
  ): Promise<boolean> {
    if (options && options.headers) {
      this.setHeaders(request, options.headers);
    }

    const contentType = options && options.default_response_content_type
      ? options.default_response_content_type
      : "application/json";

    // Attach properties
    request.url_path = this.getUrlPath(request);
    request.url_query_params = this.getUrlQueryParams(request);
    request.response_content_type = this.getResponseContentType(
      request,
      contentType,
    );

    // Parse the body now so that callers don't have to use async-await when
    // trying to get the body at a later time. We're sacrificing performance for
    // convenience here.
    const pb: Drash.Interfaces.ParsedRequestBody = await this.parseBody(
      request,
      options,
    );

    // Attach methods
    const t = this;
    request.getBodyFile = function getRequestBodyFile(input: string) {
      return t.getRequestBodyFile(pb, input);
    };
    request.getBodyParam = function getRequestBodyParam(input: string) {
      return t.getRequestBodyParam(pb, input);
    };
    request.getHeaderParam = function getRequestHeaderParam(input: string) {
      return t.getRequestHeaderParam(request, input);
    };
    request.getPathParam = function getRequestPathParam(input: string) {
      return t.getRequestPathParam(request, input);
    };
    request.getUrlQueryParam = function getRequestUrlQueryParam(
      input: string,
    ) {
      return t.getRequestUrlQueryParam(request, input);
    };
    request.getCookie = function getCookie(name: string) {
      return t.getCookie(request, name);
    };
    request.accepts = function accepts(
      type: string | string[],
    ): boolean | string {
      return t.accepts(request, type);
    };

    return request;
  }

  /**
   * @description
   *     Parse the specified request's body.
   * 
   * @param any request
   * @param OptionsConfig options
   * 
   * @returns {content_type: string, data: any}
   *     Returns the content type of the body, and based on this
   *     the body itself in that format. If there is no body, it
   *     returns an empty properties
   */
  public async parseBody(
    request: any,
    options: OptionsConfig = {},
  ): Promise<Drash.Interfaces.ParsedRequestBody> {
    let ret: { content_type: string; data: any } = {
      content_type: "",
      data: undefined,
    };

    if (!this.hasBody(request)) {
      return ret;
    }

    const contentType: string = request.headers.get("Content-Type");

    // No Content-Type header? Default to this.
    if (!contentType) {
      try {
        ret.data = await this.parseBodyAsFormUrlEncoded(request);
        ret.content_type = "application/x-www-form-urlencoded";
      } catch (error) {
        throw new Error(
          `Error reading request body. No Content-Type header was specified. ` +
            `Therefore, the body was parsed as application/x-www-form-urlencoded ` +
            `by default and failed.\n` +
            error.stack,
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
        const config = options.memory_allocation;
        if (
          config && config.multipart_form_data &&
          config.multipart_form_data > 10
        ) {
          maxMemory = config.multipart_form_data;
        }
        ret.data = await this.parseBodyAsMultipartFormData(
          request.body,
          boundary,
          maxMemory,
        );
        ret.content_type = "multipart/form-data";
      } catch (error) {
        throw new Error(
          `Error reading request body as multipart/form-data.\n` + error.stack,
        );
      }
    }

    if (contentType && contentType.includes("application/json")) {
      try {
        ret.data = await this.parseBodyAsJson(request);
        ret.content_type = "application/json";
      } catch (error) {
        throw new Error(
          `Error reading request body as application/json.\n` + error.stack,
        );
      }
    }

    if (
      contentType &&
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      try {
        ret.data = await this.parseBodyAsFormUrlEncoded(request);
        ret.content_type = "application/x-www-form-urlencoded";
      } catch (error) {
        throw new Error(
          `Error reading request body as application/x-www-form-urlencoded.\n` +
            error.stack,
        );
      }
    }

    return ret;
  }

  /**
   * @description
   *    Parse this request's body as application/x-www-form-url-encoded.
   *
   * @return Promise<object|Array<>>
   *    Returns an empty object if no body exists, else a key/value pair
   *    array e.g. returnValue['someKey']
   */
  public async parseBodyAsFormUrlEncoded(
    request: any,
  ): Promise<object | Array<any>> {
    let body = decoder.decode(await Deno.readAll(request.body));
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
  public async parseBodyAsJson(request: any): Promise<object> {
    const data = decoder.decode(await Deno.readAll(request.body));
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
  ): Promise<any> {
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
   * @param any request
   * @param any headers
   * 
   * @return void
   */
  public setHeaders(request: any, headers: any): void {
    if (headers) {
      for (let key in headers) {
        request.headers.set(key, headers[key]);
      }
    }
  }
}
