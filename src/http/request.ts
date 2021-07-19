import * as Drash from "../../mod.ts";

import {
  FormFile,
} from "../../deps.ts";
import { Response } from "./response.ts";
import { Resource } from "./resource.ts";
import { Server } from "./server.ts";
import { mimeDb } from "../dictionaries/mime_db.ts";

export class Request implements Drash.Interfaces.ICreateable {
  public parsed_body: Drash.Interfaces.IRequestParsedBody = {
    content_type: "",
    data: undefined,
  };
  public path_params: { [key: string]: string } = {};
  public resource: Resource | null = null;
  protected options: Drash.Interfaces.IRequestOptions = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public create() {
    return;
  }

  public addOptions(options: Drash.Interfaces.IRequestOptions) {
    return;
  }

  public async clone(options: Drash.Interfaces.IRequestOptions): Promise<this> {
    const clone = Object.create(this);
    clone.options = options;

    if (clone.hasBody()) {
      await clone.parseBody();
    }

    return clone;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public get method(): string {
    return this.options.original_request!.method;
  }

  public get url_path(): string {
    let path = this.options.original_request!.url;

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

  public get url_query_params(): Drash.Interfaces.IKeyValuePairs<string> {
    let queryParams: Drash.Interfaces.IKeyValuePairs<string> = {};

    try {
      let queryParamsString = this.url_query_string;
      if (!queryParamsString) {
        queryParamsString = "";
      }
      queryParams = this.parseQueryParamsString(
        queryParamsString,
      );
    } catch (error) {
      // Do absofruitly nothing
    }

    return queryParams;
  }

  public get url_query_string(): null | string {
    let queryString = null;

    if (this.options.original_request!.url.indexOf("?") == -1) {
      return queryString;
    }

    try {
      queryString = this.options.original_request!.url.split("?")[1];
    } catch (error) {
      // ha.. do nothing
    }

    return queryString;
  }

  /**
   * Used to check which headers are accepted.
   *
   * @param type - It is either a string or an array of strings that contains
   * the Accept Headers.
   * @returns Either true or the string of the correct header.
   */
  public accepts(type: string | string[]): boolean | string {
    return this.validateAccepts(this, type);
  }

  /**
   * Checks if the incoming request accepts the type(s) in the parameter.  This
   * method will check if the requests `Accept` header contains the passed in
   * types
   *
   * @param request - The request object containing the `Accept` header.
   * @param type - The content-type/mime-type(s) to check if the request accepts
   * it.
   *
   * @remarks
   * Below are examples of how this method is called from the request object
   * and used in resources:
   *
   * ```ts
   * // File: your_resource.ts // assumes the request accepts "text/html"
   * const val = this.request.accepts("text/html"); // "text/html"
   *
   * // or can also pass in an array and will match on the first one found
   * const val = this.request.accepts(["text/html", "text/xml"]); // "text/html"
   *
   * // and will return false if not found
   * const val = this.request.accepts("text/xml"); // false
   * ```
   * @returns False if the request doesn't accept any of the passed in types, or
   * the content type that was matches
   */
  public validateAccepts(
    request: Request,
    type: string | string[],
  ): boolean | string {
    let acceptHeader = request.options.original_request!.headers.get("Accept");

    if (!acceptHeader) {
      acceptHeader = request.options.original_request!.headers.get("accept");
    }

    if (!acceptHeader) {
      return false;
    }

    // for when `type` is a string
    if (typeof type === "string") {
      return acceptHeader.indexOf(type) >= 0 ? type : false;
    }

    // for when `type` is an array
    const matches = type.filter((t) => acceptHeader!.indexOf(t) >= 0);
    return matches.length ? matches[0] : false; // return first match
  }

  /**
   * Gets all the body params
   *
   * @return The parsed body as an object
   */
  public getAllBodyParams(): Drash.Interfaces.IRequestParsedBody {
    return this.parsed_body;
  }

  /**
   * Gets all header params
   *
   * @return Key value pairs for the header name and it's value
   */
  public getAllHeaderParams(): { [key: string]: string } {
    let headers: { [key: string]: string } = {};
    for (const pair of this.options.original_request!.headers.entries()) {
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
  public async getBodyFile(input: string): Promise<void> {
    if (!this.hasBody()) {
      return;
    }

    const body = await this.parseBody();
    // if (typeof this.parsed_body.data!.file === "function") {
    //   const file = this.parsed_body.data!.file(input);
    //   // `file` can be of types: FormFile | FormFile[] | undefined.
    //   // Below, we get pass the TSC error of this not being of
    //   // type `FormFile | undefined`
    //   if (Array.isArray(file)) {
    //     return file[0];
    //   }
    //   return file;
    // }
    // return undefined;
  }

  /**
   * Get the value of one of this request's body params by its input name.
   *
   * @returns The corresponding parameter or null if not found
   */
  public async getBodyParam(input: string): Promise<Drash.Interfaces.IRequestParsedBody | void> {
    // console.log(this.parsed_body);
    return;
    // return this.parsed_body[input];
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
      this.options.original_request!,
    );
    return cookies[name];
  }

  /**
   * Get the value of one of this request's headers by its input name.
   *
   * @returns The corresponding header or null if not found.
   */
  public getHeaderParam(input: string): string | null {
    return this.options.original_request!.headers.get(input);
  }

  /**
   * Get the value of one of this request's path params by its input name.
   *
   * @returns The corresponding path parameter or null if not found.
   */
  public getPathParam(input: string): string | null {
    // request.path_params is set in Server.getResourceClass()
    let param = this.path_params[input];
    if (param) {
      return param;
    }
    return null;
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
   * Parse a URL query string in it's raw form.
   *
   * If the request body's content type is `application/json`, then:
   * {"username":"root","password":"alpine"} becomes
   * { username: "root", password: "alpine" }.
   *
   * If the request body's content type is `application/x-www-form-urlencoded`,
   * then:
   * `username=root&password=alpine` becomes
   * `{ username: "root", password: "alpine" }`.
   *
   * @param queryParamsString - The query params string (e.g.,
   * hello=world&ok=then&git=hub)
   * @param keyFormat - (optional) The format the keys should be mutated to. For
   * example, if "underscore" is specified, then the keys will be converted from
   * key-name to key_name. Defaults to "normal", which does not mutate the keys.
   * @param keyCase - (optional) The case the keys should be mutated to. For
   * example, if "lowercase" is specified, then the keys will be converted from
   * Key-Name to key-name. Defaults to "normal", which does not mutate the keys.
   *
   * @returns A key-value pair array.  `{ [key: string]: string }`. Returns an
   * empty object if the first argument is empty.
   */
  protected parseQueryParamsString(
    queryParamsString: string,
    keyFormat: string = "normal",
    keyCase: string = "normal",
  ): { [key: string]: string } {
    let queryParams: { [key: string]: string } = {};

    if (!queryParamsString) {
      return queryParams;
    }

    if (queryParamsString.indexOf("#") != -1) {
      queryParamsString = queryParamsString.split("#")[0];
    }

    let queryParamsExploded = queryParamsString.split("&");

    queryParamsExploded.forEach((kvpString) => {
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
        key = kvpStringSplit[0].replace(/-/g, "_");
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
   * Does this request have a body?
   *
   * @returns True if this request has a body; false if not.
   */
  public hasBody(): boolean {
    let contentLength = this.options.original_request!.headers.get(
      "content-length",
    );

    if (!contentLength) {
      contentLength = this.options.original_request!.headers.get(
        "Content-Length",
      );
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
  public async parseBody(): Promise<Drash.Interfaces.IRequestParsedBody> {
    const contentType = this.options.original_request!.headers.get(
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
            this.options.original_request!.body,
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
   * Parse this request's body as application/x-www-form-url-encoded.
   *
   * @returns A `Promise` of an empty object if no body exists, else a key/value
   * pair array (e.g., `returnValue['someKey']`).
   */
  public async parseBodyAsFormUrlEncoded(): Promise<
    { [key: string]: unknown }
  > {
    let body = Drash.Deps.decoder.decode(
      await Deno.readAll(this.options.original_request!.body),
    );
    if (body.indexOf("?") !== -1) {
      body = body.split("?")[1];
    }
    body = body.replace(/\"/g, "");
    return this.parseQueryParamsString(body);
  }

  /**
   * Parse this request's body as application/json.
   *
   * @returns A `Promise` of a JSON object decoded from request body.
   */
  public async parseBodyAsJson(): Promise<{ [key: string]: unknown }> {
    const data = decoder.decode(
      await Deno.readAll(this.options.original_request!.body),
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

  /**
   * Respond the the client's request by using the original request's
   * `respond()` method.
   *
   * @param output - The data to respond with.
   */
  public async respond(
    output: any,
  ): Promise<void> {
    this.options.original_request!.respond(output);
  }

  /**
   * Set headers on the request.
   *
   * @param headers - Headers in the form of `{[key: string]: string}`.
   */
  public setHeaders(headers: { [key: string]: string }): void {
    if (headers) {
      for (let key in headers) {
        this.options.original_request!.headers.set(key, headers[key]);
      }
    }
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

      for (let key in mimeDb) {
        if (!mimeType) {
          const extensions = mimeDb[key].extensions;
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
   * Set the `request.path_params` property after finding the given resource so
   * the user can access them via `this.request.getPathParamValue()`.
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
    resource.uri_paths_parsed.forEach(
      (pathObj: Drash.Interfaces.IResourcePathsParsed) => {
        pathObj.params.forEach((paramName: string, index: number) => {
          this.path_params[paramName] = resource.path_params[index];
        });
      },
    );
  }
}
