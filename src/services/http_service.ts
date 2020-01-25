import Drash from "../../mod.ts";
import { contentType } from "../../deps.ts";
import { BufReader } from "../../deps.ts";
const decoder = new TextDecoder();

/**
 * @memberof Drash.Services
 * @class HttpService
 *
 * @description
 *     This class helps perform HTTP-related processes.
 */
export default class HttpService {
  public async parseMultipartFormData(request): Promise<any> {
    let body = new TextDecoder().decode(await Deno.readAll(request.body));
    let boundary = this.getMultipartFormDataBoundary(body);
    let parts = this.parseMultipartFormDataParts(body, boundary);
    return parts;
  }
  public async parseMultipartFormDataParts(body: string, boundary: string): Promise<any> {
    let parsed: any = {};
    let parts = body.split(boundary);
    // The boundary end should always be `boundary` + --, so if it -- wasn't
    // found at the end of the array, then we don't know what the hell it is
    // we're parsing
    const end = parts[parts.length - 1].trim();
    if (end != "--") {
      throw new Error("Error parsing boundary end.");
    }
    // Clean up the array so we can parse what we care about
    parts.shift();
    parts.pop();

    let parsedRaw: any = {};

    parts.forEach((part) => {
      const headers: string|string[] = part.match(/.+(\r|\n).+/);
      headers.pop();
      let splitHeaders = headers[0].split("\n")
      let content = part.split(splitHeaders[splitHeaders.length - 1]);
      content.shift();

      let parsedHeaders = headers.map((header) => {
        let parsedHeaders: any = {};
        let splitHeader = header.split("\n");
        if (splitHeader.length > 1) {
          splitHeader.forEach((fullLine, index) => {
            let splitLine = fullLine.split(";");
            if (splitLine.length > 1) {
              splitHeader.shift();
              splitLine.forEach((linePart) => {
                splitHeader.push(linePart.trim());
              });
            }
          });
        }
        splitHeader = splitHeader.map((fullLine) => {
          return fullLine
          .replace(": ", "=")
          .replace(/\"/g, "");

        });
        let parsableString = splitHeader.join("&");
        let params = this.parseQueryParamsString(parsableString);
        if (!params.filename) {
          params.filename = null;
        }
        return params;
      })[0];

      parsedRaw[parsedHeaders.name] = {
        headers: parsedHeaders,
        contents: content[0].trim() + "\n"
      };
    });

    return parsedRaw;
  }
  public getMultipartFormDataBoundary(body: string): string {
    return body.split("\n").shift();
  }
  /**
   * @description
   *     Parse the body of the request so that it can be used as an associative
   *     array.
   *
   *     If the request body's content type is `application/json`, then
   *     `{"username":"root","password":"alpine"}` becomes `{ username: "root", password: "alpine" }`.
   *
   *     If the request body's content type is
   *     `application/x-www-form-urlencoded`, then
   *     `username=root&password=alpine` becomes `{ username: "root", password: "alpine" }`.
   *
   *     If the body can't be parsed, then this method will set
   *     `this.body_parsed` to `false` to denote that the request body was not
   *     parsed.
   *
   * @return Promise<any>
   */
  public async getHttpRequestBodyParsed(request): Promise<any> {
    let body: any = {};

    if (!this.requestHasBody(request)) {
      return body;
    }

    if (request.headers.get("Content-Type").includes("multipart/form-data")) {
      request.body_parsed = this.parseMultipartFormData(request);
      return request.body_parsed;
    }

    try {
      body = decoder.decode(await Deno.readAll(request.body));
    } catch (error) {
      return body; // TODO(crookse) Should return an error?
    }

    let parsed: any;
    // Decide how to parse the string below. All HTTP requests will default
    // to application/x-www-form-urlencoded IF the Content-Type header is
    // not set in the request.
    //
    // ... there's going to be potential fuck ups here btw ...

    // Is this an application/json body?
    if (request.headers.get("Content-Type") == "application/json") {
      try {
        parsed = JSON.parse(body);
        request.body_parsed = parsed;
        return request.body_parsed;
      } catch (error) {
        parsed = false;
      }
    }

    // Does this look like an application/json body?
    if (!parsed) {
      try {
        parsed = JSON.parse(body);
        request.body_parsed = parsed;
        return request.body_parsed;
      } catch (error) {
      }
    }

    // All HTTP requests default to application/x-www-form-urlencoded, so
    // try to parse the body as a URL query params string if the above logic
    // didn't work.
    if (!parsed) {
      try {
        if (body.indexOf("?") !== -1) {
          body = body.split("?")[1];
        }
        parsed = this.parseQueryParamsString(body);
        request.body_parsed = parsed;
        return request.body_parsed;
      } catch (error) {
      }
    }

    request.body_parsed = undefined;
    return request.body_parsed; // return false if we can't parse the body
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

    request.getBodyMultipartForm= function(): any {
      return request.body_parsed;
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
    request.parseBody = () => {
      return this.getHttpRequestBodyParsed(request);
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
  public parseQueryParamsString(queryParamsString: string): any {
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
      queryParams[kvpStringSplit[0]] = kvpStringSplit[1];
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
