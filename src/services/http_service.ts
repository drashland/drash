import Drash from "../../mod.ts";
import { contentType } from "../../deps.ts";
import { BufReader, ReadLineResult, StringReader } from "../../deps.ts";
const decoder = new TextDecoder();

/**
 * @memberof Drash.Services
 * @class HttpService
 *
 * @description
 *     This class helps perform HTTP-related processes.
 */
export default class HttpService {
  public async getMultipartPartContents(part: string, boundary: Uint8Array, headers: any): Promise<any> {
    const sr = new StringReader(part);
    const br = new BufReader(sr);
    const decoder = new TextDecoder();
    const dBoundary = decoder.decode(boundary).trim();
    const dBoundaryEnd = "--";

    // console.log(headers.headers_as_string);

    let contents = "";

    for (;;) {
      let line: any = await br.readLine();
      line = line.line;
      let dLine = decoder.decode(line);
      // Is this a boundary end?
      if (dLine.trim() == dBoundaryEnd) {
        console.log("boundary end");
        break;
      }
      // Is this a boundary end?
      if (dLine.slice(0, -2).trim() == dBoundary) {
        console.log("sliced");
        break;
      }
      console.log("dLine: " + dLine);
      // Is this a header?
      if (headers.headers_as_array.indexOf(dLine) != -1) {
        console.log("is header");
        continue;
      }
      console.log("contents is now");
      contents += "\n" + dLine;
      console.log(contents);
    }
    return contents.trim();
  }

  public async getMultipartPartHeaders(part: string): Promise<any> {
    part = part.trim();
    const sr = new StringReader(part);
    const br = new BufReader(sr);

    let contents = "";
    let headersAsString = "";

    for (;;) {
      let line: any = await br.readLine();
      line = line.line;
      let dLine = decoder.decode(line);
      if (dLine.trim() == "") {
        break;
      }
      // console.log(dLine);
      contents += ("; " + dLine);
      headersAsString += (dLine + "\n");
    }

    contents = contents.trim();

    // console.log("------------------------------- HEADERS");
    let headers = contents
      .replace(/: /g, "=")
      .replace(/; /g, "&")
      .replace(/\"/g, "")
      .substr(1); // remove beginning ampersand
    // console.log(headers);
    let headersObj = this.parseQueryParamsString(headers);
    if (!headersObj.filename) {
      headersObj.filename = null;
    }
    // console.log("------------------------------- END HEADERS");

    let headersAsArray = headersAsString.split("\n");
    console.log(headersAsArray);
    let headersAsArrayFiltered = headersAsArray.filter((header) => {
      return header.trim() != "";
    });

    return {
      headers: headersObj,
      headers_as_string: headersAsString,
      headers_as_array: headersAsArrayFiltered
    };
  }

  public async parseMultipartFormData(request): Promise<any> {
    let body = new TextDecoder().decode(await Deno.readAll(request.body));
    let boundary = this.getMultipartFormDataBoundary(body);
    let parts = await this.parseMultipartFormDataParts(body, boundary);
    return parts;
  }

  public async parseMultipartFormDataParts(body: string, boundary: string): Promise<any> {
    // console.log(body);
    let parsed: any = {};
    let matches = body.match(new RegExp(boundary, "g")).length;
    // let matchedB = body.match(new RegExp(boundary + "--", "g")).length;
    // console.log(matchedB);
    let parts = body.split(boundary);
    parts.shift();
    // The boundary end should always be `boundary` + --, so if -- wasn't found
    // at the end of the array, then we don't know what the hell it is we're
    // parsing.
    parts.forEach((part, index) => {
      console.log(index);
      console.log(part);
      parts[index] = parts[index].replace(boundary + "--", "");
    });
    // if (parts.length > 1) {
    //   const end = parts[parts.length - 1].trim();
    //   console.log("end");
    //   console.log(end);
    //   console.log("end end");
    //   if (
    //     end != "--"
    //     && end != boundary.trim()
    //   ) {
    //     throw new Error("Error parsing boundary end.");
    //   }
    //   parts.pop();
    // } else {
    //   parts[0] = parts[0].replace(boundary + "--", "");
    // }

    let parsedRaw: any = {};

    for (let i in parts) {
      let part = parts[i];
      const headers = await this.getMultipartPartHeaders(part);
      console.log(part);
      parsedRaw[headers.headers.name] = {
        headers: headers.headers,
        contents: await this.getMultipartPartContents(part + "--", new TextEncoder().encode(boundary), headers) + "\n",
      };
    }
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
      request.body_parsed = await this.parseMultipartFormData(request);
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
