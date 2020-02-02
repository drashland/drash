import {
  MultipartReader,
  ServerRequest,
  contentType,
} from "../../deps.ts";
import StringService from "./string_service.ts";
const decoder = new TextDecoder();
const encoder = new TextEncoder();

interface ParsedBody {
  content_type: any|undefined,
  data: any|undefined
}

/**
 * @memberof Drash.Services
 * @class HttpRequestService
 *
 * @description
 *     This class helps perform HTTP request related processes.
 */
export default class HttpRequestService {

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC //////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

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
  public getBodyFile(parsedBody: ParsedBody, input: string): any {
    if (
      !parsedBody.content_type
      || !parsedBody.content_type.includes("multipart/form-data")
    ) {
      throw new Error(
        `Cannot read request Content-Type of ${contentType}. `
        + `When using \`getBodyFile()\`, the only allowed type is `
        + `\`multipart/form-data\`.`
      );
    }

    return parsedBody.data[input];
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
  public getBodyParam(parsedBody: ParsedBody, input: string): any {
    if (
      !parsedBody.content_type
      || (
        !parsedBody.content_type.includes("application/json")
        && !parsedBody.content_type.includes("application/x-www-form-urlencoded")
      )
    ) {
      throw new Error(
        `Cannot read request Content-Type of ${contentType}. `
        + `When using \`getBodyParam()\`, the only allowed types are `
        + `\`application/json\` and \`application/x-www-form-urlencoded\`.`
      );
    }

    return parsedBody.data[input];
  }

  /**
   * @description
   *     Get the value of one of this request's headers by its input name.
   *
   * @return string
   */
  public getHeaderParam(request: any, input: string): any {
    return request.headers.get(input);
  }

  /**
   * @description
   *     Get the value of one of this request's path params by its input name.
   *
   * @return string
   */
  public getPathParam(request: any, input: string): string {
    // request.path_params is set in Drash.Http.Server.getResourceClass()
    return request.path_params[input];
  }

  /**
   * @description
   *     Get the value of one of this request's query params by its input name.
   *
   * @return string
   */
  public getQueryParam(request: any, input: string): string {
    if (!request.url_query_params) {
      request.url_query_params = this.getUrlQueryParams(request);
    }
    return request.url_query_params[input];
  };

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
    defaultContentType: string = "application/json"
  ): void {
    // application/json will be used for any falsy defaultContentType argument
    defaultContentType = defaultContentType
      ? defaultContentType
      : "application/json";

    let contentType = null;

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
    contentType = request.parsed_body && request.parsed_body.response_content_type
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
  public getUrlPath(request): string {
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
    let queryParams = {};

    try {
      let queryParamsString = this.getUrlQueryString(request);
      queryParams = StringService.parseQueryParamsString(queryParamsString);
    } catch (error) {}

    return queryParams;
  }

  /**
   * @description
   *     Get the specified HTTP request's URL query string.
   *
   * @return string
   *     Returns the URL query string (e.g., key1=value1&key2=value2) without
   *     the leading "?" character.
   */
  public getUrlQueryString(request: any): string {
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
   * @return boolean
   *     Returns `true` if the request has a body. Returns `false` if not.
   */
  public hasBody(request: any): boolean {
    return parseInt(request.headers.get("content-length")) > 0;
  }

  /**
   * @description
   *     Hydrate the specified request object.
   *
   * @return
   *     Returns a hydrated request object. For example, deno uses the
   *     `ServerRequest` object. This method takes that object and adds more
   *     porperties and methods to it. This makes it easier for Drash to process
   *     the object for its own purposes.
   */
  public async hydrate(request: any, options?: any): Promise<any> {
    if (options.headers) {
      this.setHeaders(request, options.headers);
    }

    // Attach properties
    request.url_path = this.getUrlPath(request);
    console.log(request.url_path);
    request.url_query_params = this.getUrlQueryParams(request);
    request.response_content_type = this.getResponseContentType(
      request,
      options.default_response_content_type
    );

    // Parse the body now so that callers don't have to use async-await when
    // trying to get the body at a later time. We're sacrificing performance for
    // convenience here.
    const pb: ParsedBody = await this.parseBody(request, options);

    // Attach methods
    request.getBodyFile = async function getBodyFile(input: string) {
      return await this.getBodyFile(pb, input);
    };
    request.getBodyParam = async function getBodyParam(input: string) {
      return await this.getBodyParam(pb, input);
    };
    request.getHeaderParam = async function getHeaderParam(input: string) {
      return await this.getHeaderParam(request, input);
    };
    request.getPathParam = async function getPathParam(input: string) {
      return await this.getPathParam(request, input);
    };
    request.getQueryParam = async function getQueryParam(input: string) {
      return await this.getQueryParam(pb, input);
    };

    return request;
  }

  /**
   * @description
   *     Parse the specified request's body.
   */
  public async parseBody(request: any, options: any = {}): Promise<ParsedBody> {
    let ret: ParsedBody;

    if (!this.hasBody(request)) {
      return ret;
    }

    // Convert memory to megabytes for parsing multipart/form-data. Also,
    // default to 10 megabytes if memory allocation wasn't specified.
    if (!options.memory_allocation.multipart_form_data) {
      options.memory_allocation.multipart_form_data = (1024 * 1024) * 128;
    } else {
      options.memory_allocation.multipart_form_data *= (1024 * 1024);
    }

    const contentType = request.headers.get("Content-Type");

    // No Content-Type header? Default to this.
    if (!contentType) {
      try {
        ret.data = this.parseBodyAsFormUrlEncoded(request);
        ret.content_type = "application/x-www-form-urlencoded";
      } catch (error) {
        throw new Error(
          `Error reading request body. No Content-Type header was specified. `
          + `Therefore, the body was parsed as application/x-www-form-urlencoded `
          + `by default and failed.\n` + error.stack
        );
      }
    }

    if (contentType.includes("multipart/form-data")) {
      try {
        ret.data = await this.parseBodyAsMultipartFormData(
          request,
          options.memory_allocation.multipart_form_data
        );
        ret.content_type = "multipart/form-data";
      } catch (error) {
        throw new Error(
          `Error reading request body as multipart/form-data.\n`
          + error.stack
        );
      }
    }

    if (request.headers.get("Content-Type").includes("application/json")) {
      try {
        ret.data = this.parseBodyAsJson(request);
        ret.content_type= "application/json";
      } catch (error) {
        throw new Error(
          `Error reading request body as application/json.\n`
          + error.stack
        );
      }
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
      try {
        ret.data = this.parseBodyAsFormUrlEncoded(request);
        ret.content_type = "application/x-www-form-urlencoded";
      } catch (error) {
        throw new Error(
          `Error reading request body as application/x-www-form-urlencoded.\n`
          + error.stack
        );
      }
    }

    return ret;
  }

  /**
   * @description
   *    Parse this request's body as application/x-www-form-url-encoded.
   *
   * @return any
   */
  public async parseBodyAsFormUrlEncoded(request: any): Promise<any> {
    let body = decoder.decode(await Deno.readAll(request.body));
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
  public async parseBodyAsJson(request: any): Promise<any> {
    const data = decoder.decode(await Deno.readAll(request.body));
    return JSON.parse(data);
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
  ): Promise<any> {
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
  public setHeaders(request:any, headers: any) {
    if (headers) {
      for (let key in headers) {
        request.headers.set(key, headers[key]);
      }
    }
  }
}
