import Drash from "../../mod.ts";
import { contentType } from "../../deps.ts";
import { BufReader, ReadLineResult, StringReader } from "../../deps.ts";
const { Buffer } = Deno;
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const debug = (message) => {
  if (Deno.env().DEBUG_HTTP_SERVICE) {
    console.log(message);
  }
};

interface FormFileSchema {
  content_disposition?: string;
  content_type?: string;
  contents: any;
  filename?: string;
  name: string;
  size?: number;
}

/**
 * @memberof Drash.Services
 * @class HttpService
 *
 * @description
 *     This class helps perform HTTP-related processes.
 */
export default class HttpService {
  public async getMultipartPartContents(part: string, boundary: Uint8Array, headers: any): Promise<any> {
    const sr = new StringReader(part + "\n\n--");
    const br = new BufReader(sr);
    const decoder = new TextDecoder();
    const dBoundary = decoder.decode(boundary).trim();

    let contents = "";

    for (;;) {
      let line: any = await br.readLine();
      line = line.line;
      let decodedLine = decoder.decode(line);
      debug("decodedLine: " + decodedLine);
      // Is this a boundary end?
      if (decodedLine.trim() == "--") {
        debug("is boundary end");
        break;
      }
      // Is this a header?
      if (headers.as_array.indexOf(decodedLine) != -1) {
        // debug("is header");
        continue;
      }
      contents += ("\n" + decodedLine);
      // debug("contents is now");
      // debug(contents);
    }

    contents = contents
      .trim()
      .replace(dBoundary + "--", "")
      .trim()
      .concat("\n");
    // debug("full contents");
    // debug(contents);
    // debug("end full contents");
    return contents;
  }

  public async getMultipartPartHeaders(part: Uint8Array): Promise<any> {
    const br = new BufReader(new Buffer(part));

    let contents = "";
    let headersAsString = "";

    for (;;) {
      let line: any = await br.readLine();
      line = line.line;
      let decodedLine = decoder.decode(line);
      if (decodedLine.trim() == "") {
        break;
      }
      contents += ("; " + decodedLine);
      headersAsString += (decodedLine + "\n");
    }

    contents = contents.trim();

    // debug("headers");
    let headers = contents
      .replace(/: /g, "=")
      .replace(/; /g, "&")
      .replace(/\"/g, "")
      .substr(1); // remove beginning ampersand
    // debug(headers);
    // debug("end headers");
    let headersAsObj = this.parseQueryParamsString(headers, "underscore", "lowercase");
    if (!headersAsObj.filename) {
      headersAsObj.filename = null;
    }

    let headersAsArray = headersAsString.split("\n");
    let headersAsArrayFiltered = headersAsArray.filter((header) => {
      return header.trim() != "";
    });

    return {
      as_obj: headersAsObj,
      as_string: headersAsString,
      as_array: headersAsArrayFiltered
    };
  }

  public async parseRequestBodyDefault(
    request: any,
    isDefault: boolean = false
  ): Promise<any> {
    try {
      let body = decoder.decode(await Deno.readAll(request.body));
      if (body.indexOf("?") !== -1) {
        body = body.split("?")[1];
      }
      return this.parseQueryParamsString(body);
    } catch (error) {
      throw new Error("Error reading the request body.\n" + error);
    }
  }

  public async parseRequestBodyAsFormUrlEncoded(
    request: any,
    isDefault: boolean = false
  ): Promise<any> {
    try {
      let body = decoder.decode(await Deno.readAll(request.body));
      if (body.indexOf("?") !== -1) {
        body = body.split("?")[1];
      }
      return this.parseQueryParamsString(body);
    } catch (error) {
      throw new Error("Error reading request body as application/x-www-form-urlencoded.\n" + error);
    }
  }

  public async parseRequestBodyAsMultipartFormData(request: any): Promise<any> {
    try {
      let body = await Deno.readAll(request.body)
      return await this.parseMultipartFormDataParts(body);
    } catch (error) {
      throw new Error("Error reading request body as multipart/form-data.\n" + error);
    }
  }

  public async parseRequestBodyAsJson(request: any): Promise<any> {
    try {
      let body = decoder.decode(await Deno.readAll(request.body));
      return JSON.parse(body);
    } catch (error) {
      throw new Error("Error reading request body as application/json.\n" + error);
    }
  }

  public async parseMultipartFormDataParts(
    body: Uint8Array
  // ): Promise<boolean|FormFileSchema> {
  ): Promise<any> {
    let br = new BufReader(new Buffer(body));
    let boundary: string = null
    let decodedParts: string[] = [];
    let contents: string = "";

    for (;;) {
      let line: any = await br.readLine();
      // Trim the right side because line endings can suck between OSs and can
      // cause lines (coming from different OSs) to be parsed differently
      let decodedLine = decoder.decode(line.line).trimRight();
      if (!boundary) {
        boundary = decodedLine;
        continue;
      }
      if (decodedLine == boundary) {
        decodedParts.push(contents.trimRight());
        contents = "";
        continue;
      }
      if (decodedLine == (boundary + "--")) {
        // Trim the right side again. `getMultipartPartContents` will add the
        // "\n" character after it is done parsing through the content part of
        // the data
        decodedParts.push(contents.trimRight());
        contents = "";
        break;
      }
      contents += (decodedLine + "\n");
    }

    // debug(decodedParts);

    let formFiles: any = {};

    for (let i in decodedParts) {
      let part = decodedParts[i].trim().replace(boundary + "--", "");
      const headers = await this.getMultipartPartHeaders(encoder.encode(part));
      const contents = await this.getMultipartPartContents(part, encoder.encode(boundary), headers);
      const headersObj = headers.as_obj;
      formFiles[headersObj.name] = {
        name: headersObj.name, // This is not the same as the filename field
        filename: headersObj.filename
          ? headersObj.filename
          : null,
        content_disposition: headersObj.content_disposition
          ? headersObj.content_disposition
          : null,
        content_type: headersObj.content_type
          ? headersObj.content_type
          : null,
        size: headersObj.size
          ? headersObj.size
          : null,
        contents: contents
      };
    }

    return formFiles;
  }

  /**
   * @description
   *     Parse the body of the request so that it can be used as an associative
   *     array.
   *
   *     If the request body's content type is `multipart/form-data`, then the
   *     files specified will use the `FormFileSchema` interface.
   *
   *     If the request body's content type is `application/json`, then
   *     `{"username":"root","password":"alpine"}` becomes `{ username: "root", password: "alpine" }`.
   *
   *     If the request body's content type is
   *     `application/x-www-form-urlencoded`, then
   *     `username=root&password=alpine` becomes `{ username: "root", password: "alpine" }`.
   *
   *     If the body can't be parsed, then this method will return false.
   *
   *     If a body isn't specified, then this method will return undefined.
   *
   * @return Promise<any>
   */
  public async parseRequestBody(request): Promise<any> {
    if (!this.requestHasBody(request)) {
      return undefined;
    }

    if (request.headers.get("Content-Type").includes("multipart/form-data")) {
      return await this.parseRequestBodyAsMultipartFormData(request);
    }

    if (request.headers.get("Content-Type").includes("application/json")) {
      return this.parseRequestBodyAsJson(request);
    }

    if (request.headers.get("Content-Type").includes("application/x-www-form-urlencoded")) {
      return this.parseRequestBodyAsFormUrlEncoded(request);
    }

    // Default to parsing as application/x-www-form-urlencoded
    return this.parseRequestBodyDefault(request, true);
  }

  /**
   * @description
   *     Hydrate the request with data that is useful for the
   *     `Drash.Http.Server` class.
   *
   * @param ServerRequest request
   *     The request object.
   * @param any options
   *     A list of options.
   */
  public hydrateHttpRequest(request, options?: any) {
    if (options) {
      if (options.headers) {
        for (let key in options.headers) {
          request.headers.set(key, options.headers[key]);
        }
      }
    }

    // Attach properties
    request.url_query_params = this.getHttpRequestUrlQueryParams(request);
    request.url_query_string = this.getHttpRequestUrlQueryString(request);
    request.url_path = this.getHttpRequestUrlPath(request);
    request.uri = this.getHttpRequestUrlPath(request);
    request.url = options && options.base_url
      ? options.base_url + request.url
      : request.url;

    // Attach methods
    request.getBodyParam = function(httpVar: string): any {
      return request.body_parsed[httpVar];
    };
    request.getBodyMultipartFormData = function(inputName): any {
      return request.body_parsed[inputName];
    };
    request.getHeaderParam = function(httpVar: string): any {
      return request.headers.get(httpVar);
    };
    request.getPathParam = function(httpVar: string): any {
      return request.path_params[httpVar];
    };
    request.getQueryParam = function(httpVar: string): any {
      return request.url_query_params[httpVar];
    };
    request.parseBody = async () => {
      request.body_parsed = await this.parseRequestBody(request);
      return request.body_parsed;
    }

    request.response_content_type = this.getResponseContentType(request);

    return request;
  }

  /**
   * @description
   *     Get the specified HTTP request's URL path.
   *
   * @param ServerRequest request
   *     The request object.
   *
   * @return string
   *     Returns the URL path.
   */
  public getHttpRequestUrlPath(request): string {
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
   *     Get the specified HTTP request's URL query string.
   *
   * @param ServerRequest request
   *     The request object.
   *
   * @return string
   *     Returns the URL query string (e.g., key1=value1&key2=value2) without
   *     the leading "?" character.
   */
  public getHttpRequestUrlQueryString(request): string {
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
   *     Get the HTTP request's URL query params by parsing the URL query string.
   *
   * @param ServerRequest request
   *     The request object.
   *
   * @return any
   *     Returns the URL query string in key-value pair format.
   */
  public getHttpRequestUrlQueryParams(request): any {
    let queryParams = {};

    try {
      let queryParamsString = request.url.split("?")[1];
      queryParams = this.parseQueryParamsString(queryParamsString);
    } catch (error) {}

    return queryParams;
  }

  /**
   * @description
   *     Get a MIME type for a file based on its extension.
   *
   * @param string filePath
   *     The file path in question.
   * @param boolean fileIsUrl
   *     (optional) Is the file path  a URL to a file? Defaults to false.
   *
   *     If the file path is a URL, then this method will make sure the URL
   *     query string is not included while doing a lookup of the file's
   *     extension.
   *
   * @return string
   *     Returns the name of the MIME type based on the extension of the
   *     file path .
   */
  public getMimeType(filePath: string, fileIsUrl: boolean = false): string {
    let mimeType = null;

    if (fileIsUrl) {
      filePath = filePath.split("?")[0];
    }

    let fileParts = filePath.split(".");
    filePath = fileParts.pop();

    mimeType = contentType(filePath);

    return mimeType;
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
   *     `Drash.Http.Server` object's `response_output` config.
   *
   * @return string
   */
  public getResponseContentType(request): string {
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
    contentType = request.body_parsed && request.body_parsed.response_content_type
      ? request.body_parsed.response_content_type
      : contentType;

    return contentType;
  }

  /**
   * @description
   *     Parse a URL query string in it's raw form.
   *
   *     If the request body's content type is application/json, then
   *     `{"username":"root","password":"alpine"}` becomes
   *     `{ username: "root", password: "alpine" }`.
   *
   *     If the request body's content type is
   *     application/x-www-form-urlencoded, then `username=root&password=alpine`
   *     becomes `{ username: "root", password: "alpine" }`.
   *
   * @param string queryParamsString
   *     The query params string (e.g., hello=world&ok=then&git=hub)
   */
  public parseQueryParamsString(queryParamsString: string, keyFormat: string = "normal", keyCase: string = "normal"): any {
    let queryParams = {};

    if (!queryParamsString) {
      return queryParams;
    }

    if (queryParamsString.indexOf("#") != -1) {
      queryParamsString = queryParamsString.split("#")[0];
    }

    let queryParamsExploded = queryParamsString.split("&");

    queryParamsExploded.forEach(kvpString => {
      let kvpStringSplit = kvpString.split("=");
      let key: string;
      if (keyFormat == "normal") {
        key = kvpStringSplit[0];
        if (keyCase == "normal") {
          queryParams[key] = kvpStringSplit[1];
        }
        if (keyCase == "lowercase") {
          queryParams[key.toLowerCase()] = kvpStringSplit[1];
        }
      }
      if (keyFormat == "underscore") {
        key = kvpStringSplit[0]
          .replace(/-/g, "_");
        if (keyCase == "normal") {
          queryParams[key] = kvpStringSplit[1];
        }
        if (keyCase == "lowercase") {
          queryParams[key.toLowerCase()] = kvpStringSplit[1];
        }
      }
    });

    return queryParams;
  }

  /**
   * @description
   *     Does the specified request have a body?
   *
   * @param any request
   *
   * @return boolean
   */
  public requestHasBody(request: any): boolean {
    return parseInt(request.headers.get("content-length")) > 0;
  }
}
