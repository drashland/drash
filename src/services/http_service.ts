import Drash from "../../mod.ts";
import { contentType } from "../../deps.ts";
import { BufReader } from "../../deps.ts";
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const debug = (message) => {
  if (Deno.env().DEBUG_HTTP_SERVICE) {
    console.log(message);
  }
};

interface MultipartHeadersSchema {
  content_disposition?: string;
  content_type?: string;
  filename?: string;
  name: string;
}

interface MultipartSchema {
  MultipartHeadersSchema,
  contents: Uint8Array;
  bytes: number;
}

/**
 * @memberof Drash.Services
 * @class HttpService
 *
 * @description
 *     This class helps perform HTTP-related processes.
 */
export default class HttpService {
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
   * Get the contents of a single multipart body part.
   *
   * @param Uint8Array part
   *     The part containing the contents.
   * @param Uint8Array boundary
   *     The boundary of the entire multipart body. This should not included a
   *     line ending character.
   * @param MultipartHeadersSchema headers
   *     The headers of this part.
   *
   * @return Promise<string>
   *     Returns the contents.
   */
  public async getMultipartPartContents(
    part: Uint8Array,
    boundary: string,
    headersAsArray: string[]
  ): Promise<Uint8Array> {
    const br = new BufReader(new Deno.Buffer(part));

    let contents: any = [];

    for (;;) {
      let line: any = await br.readLine();
      line = line.line;
      let decodedLine: string = decoder.decode(line);
      // debug("decodedLine: " + decodedLine);
      // Is this a boundary end?
      if (decodedLine.trim() == (boundary + "--")) {
        // debug("is boundary end");
        break;
      }
      // Is this a header?
      if (headersAsArray.indexOf(decodedLine) != -1) {
        // debug("is header");
        continue;
      }
      contents.push({
        line: line,
        bytes: line.byteLength
      });
      // debug("contents is now");
      // debug(contents);
    }

    // debug("full contents");
    // debug(contents);
    // debug("end full contents");

    const totalBytes = contents.reduce((a, b) => {
      a.byteLength + b.byteLength;
    });
    let combinedLines = new Uint8Array(totalBytes);

    return contents;
  }

  /**
   * Get the headers of a single multipart body part.
   *
   * @param Uint8Array part
   *     The part containing the headers.
   *
   * @return Promise<any>
   *     Returns the headers in three forms: object, array, and string.
   */
  public async getMultipartPartHeaders(part: Uint8Array): Promise<any> {
    const br = new BufReader(new Deno.Buffer(part));

    try {
      let contents = "";
      let headersAsString = "";

      for (;;) {
        let line: any = await br.readLine();
        line = line.line;
        let decodedLine = decoder.decode(line);
        // Once we hit an empty line, that's when we know we're done parsing the
        // headers
        if (decodedLine.trim() == "") {
          break;
        }
        // Let's change up how the headers appear by adding a ; as a delimeter.
        // This makes it easier to parse and separate them into key-value pairs.
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
      let headersAsObj = this.parseQueryParamsString(
        headers,
        "underscore",
        "lowercase"
      );
      if (!headersAsObj.filename) {
        headersAsObj.filename = null;
      }

      let headersAsArray = headersAsString
        .split("\n")
        .filter((header) => {
          return header.trim() != "";
        });

      return {
        as_array: headersAsArray,
        as_object: headersAsObj,
        as_string: headersAsString,
      };
    } catch (error) {
      throw new Error("Could not read headers from multipart part.\n" + error.stack);
    }
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
   * @param string keyFormat
   *     (optional) The format the keys should be mutated to. For example, if
   *     `underscore` is specified, then the keys will be converted from
   *     `key-name` to `key_name`. Defaults to `normal`, which does not mutate
   *     the keys.
   * @param string keyCase
   *     (optional) The case the keys should be mutated to. For example, if
   *     `lowercase` is specified, then the keys will be converted from
   *     `Key-Name` to `Key-Name`. Defaults to `normal`, which does not mutate
   *     the keys.
   */
  public parseQueryParamsString(
    queryParamsString: string,
    keyFormat: string = "normal",
    keyCase: string = "normal"
  ): any {
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
   *     Parse the request body depending on its Content-Type.
   *
   * @return Promise<any|boolean>
   *     Returns a parsable object depending on the Content-Type of the request
   *     body. See the `parseRequestBodyAs*` methods below for return types.
   *
   *     Returns `false` if the body cannot be parsed.
   */
  public async parseRequestBody(request): Promise<boolean|any> {
    if (!this.requestHasBody(request)) {
      return undefined;
    }

    if (request.headers.get("Content-Type").includes("multipart/form-data")) {
      return await this.parseRequestBodyAsMultipartFormData(request.body);
    }

    if (request.headers.get("Content-Type").includes("application/json")) {
      return this.parseRequestBodyAsJson(request.body);
    }

    if (request.headers.get("Content-Type").includes("application/x-www-form-urlencoded")) {
      return this.parseRequestBodyAsFormUrlEncoded(request.body);
    }

    // Default to parsing as application/x-www-form-urlencoded
    return this.parseRequestBodyAsDefault(request.body);
  }

  /**
   * @description
   *     This method tries to parse the request body as if it were
   *     `application/x-www-form-urlencoded`. This is the default way to parse
   *     the request body if all attempts to identify the Content-Type fail.
   *
   * @param Deno.Reader reqBody
   *     The request body.
   *
   * @return Promise<any>
   *     Returns a body in key-value pair format.
   */
  public async parseRequestBodyAsDefault(reqBody: Deno.Reader): Promise<any> {
    try {
      let body = decoder.decode(await Deno.readAll(reqBody));
      if (body.indexOf("?") !== -1) {
        body = body.split("?")[1];
      }
      return this.parseQueryParamsString(body);
    } catch (error) {
      throw new Error("Error reading the request body.\n" + error.stack);
    }
  }

  /**
   * @description
   *     Parse the specified request body as `application/json`.
   *
   * @param Deno.Reader reqBody
   *     The request body.
   *
   * @return Promise<any>
   *     Returns a body as a parsable JSON object.
   */
  public async parseRequestBodyAsJson(reqBody: Deno.Reader): Promise<any> {
    try {
      let body = decoder.decode(await Deno.readAll(reqBody));
      return JSON.parse(body);
    } catch (error) {
      throw new Error("Error reading request body as application/json.\n" + error.stack);
    }
  }

  /**
   * @description
   *     Parse the specified request body as `application/x-www-url-encoded`.
   *
   * @param Deno.Reader reqBody
   *     The request body.
   *
   * @return Promise<any>
   *     Returns a body in key-value pair format.
   */
  public async parseRequestBodyAsFormUrlEncoded(reqBody: Deno.Reader): Promise<any> {
    try {
      let body = decoder.decode(await Deno.readAll(reqBody));
      if (body.indexOf("?") !== -1) {
        body = body.split("?")[1];
      }
      return this.parseQueryParamsString(body);
    } catch (error) {
      throw new Error("Error reading request body as application/x-www-form-urlencoded.\n" + error.stack);
    }
  }

  public mergeUint8Arrays(typedArrays): Uint8Array {
    let totalBytes = 0;
    for (let i in typedArrays) {
      let typedArray = typedArrays[i];
      if (typedArray && typedArray.length) {
        totalBytes += typedArray.length;
        if (typedArray.length == 0) {
          totalBytes += 1;
        }
      }
    }
    let ret = new Uint8Array(totalBytes);
    let position = 0;
    for (let i in typedArrays) {
      let typedArray = typedArrays[i];
      ret.set(typedArray, position);
      position += typedArray.length;
      if (typedArray.length == 0) {
        position += 1;
      }
    }
    return ret;
  }

  public addNewLineToUint8ArrayLine(line) {
      let newLined = new Uint8Array(line.length + 1);
      newLined.set(line, 0);
      newLined.set(encoder.encode("\n"), line.length)
      return newLined;
  }

  /**
   * @description
   *     Parse the specified request body as `multipart/form-data`.
   *
   * @param Deno.Reader reqBody
   *     The request body.
   *
   * @return Promise<any>
   *     Returns a body as a parsable JSON object where the first level of keys
   *     are the names of the parts. For example, if the name of the first part
   *     is `file_number_one`, then it will be accessible in the returned object
   *     as `{returned_object}.file_number_one`.
   */
  public async parseRequestBodyAsMultipartFormData(
    reqBody: Deno.Reader
  ): Promise<MultipartSchema> {
    let br = new BufReader(new Deno.Buffer(await Deno.readAll(reqBody)));
    let boundary: string = null;
    let finalBoundary: string = null;
    let parts: any = [];
    let contents: any = [];
    let headers: any = [];
    let allHeadersFound: boolean = false;

    try {
      for (let i = 0;; i++) {
        let line: any = await br.readLine();
        // Trim the right side because line endings can suck between OSs and can
        // cause lines (coming from different OSs) to be parsed differently
        let decodedLine = decoder.decode(line.line).trimRight();
        // If for some reason the next line after the first boundary is an empty
        // line, then damn... skip it.
        if (i == 1) {
          if (decodedLine == "") {
            continue;
          }
        }
        // No boundary found yet? Set it.
        if (!boundary) {
          boundary = decodedLine;
          finalBoundary = decodedLine + "--";
          continue;
        }
        // Did we hit a boundary? Continue on to the next part or end parsing.
        if (decodedLine.includes(boundary)) {
          parts.push({
            headers: this.mergeUint8Arrays(headers),
            contents: this.mergeUint8Arrays(contents)
          });
          // Before continue, we want to make sure we've reset the contents and
          // the headers so that the next part doesn't get mixed in with the
          // part we're currently parsing.
          contents = [];
          headers = []
          allHeadersFound = false;
          if (decodedLine == boundary.trim()) {
            continue;
          }
          if (decodedLine == finalBoundary.trim()) {
            break;
          }
        }
        if (!allHeadersFound) {
          if (decodedLine == "") {
            allHeadersFound = true;
            continue;
          }
          // `readLine()` doesn't read the line ending, so we're adding it
          headers.push(this.addNewLineToUint8ArrayLine(line.line));
          continue;
        }
        // `readLine()` doesn't read the line ending, so we're adding it
        contents.push(this.addNewLineToUint8ArrayLine(line.line));
      }
    } catch (error) {
      throw new Error("Could not separate parts from boundaries.\n" + error.stack);
    }

    // debug(parts);

    try {
      let formFiles: any = {};

      for (let i in parts) {
        // If the boundary (for some reason not known to the universe) still
        // exists after not being included in the code above, then strip that
        // shit out again.
        let part = parts[i];
        // const headers = await this.getMultipartPartHeaders(part);
        // const contents = await this.getMultipartPartContents(
        //   part,
        //   boundary,
        //   headers.as_array
        // );
        // const headersObj = headers.as_object;
        // formFiles[headersObj.name] = {
        //   name: headersObj.name, // This is not the same as the filename field
        //   filename: headersObj.filename
        //     ? headersObj.filename
        //     : null,
        //   content_disposition: headersObj.content_disposition
        //     ? headersObj.content_disposition
        //     : null,
        //   content_type: headersObj.content_type
        //     ? headersObj.content_type
        //     : null,
        //   bytes: contents.byteLength,
        //   contents: contents
        // };
      }

      return formFiles;
    } catch (error) {
      throw new Error("Error reading request body as multipart/form-data.\n" + error.stack);
    }
  }

  /**
   * @description
   *     Does the specified request have a body?
   *
   * @param any request
   *     The request object.
   *
   * @return boolean
   *     Returns `true` if the request has a body. Returns `false` if not.
   */
  public requestHasBody(request: any): boolean {
    return parseInt(request.headers.get("content-length")) > 0;
  }
}
