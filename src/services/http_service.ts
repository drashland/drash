import Drash from "../../mod.ts";

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
   *     Hydrate the request with data that is useful for the
   *     `Drash.Http.Server` class.
   *
   * @param Drash.Http.Request request
   *     The request object.
   * @param any options
   *     A list of options.
   */
  public hydrateHttpRequest(request: Drash.Http.Request, options?: any) {
    if (options) {
      if (options.headers) {
        for (let key in options.headers) {
          request.headers.set(key, options.headers[key]);
        }
      }
    }

    request.url_query_params = this.getHttpRequestUrlQueryParams(request);
    request.url_query_string = this.getHttpRequestUrlQueryString(request);
    request.url_path = this.getHttpRequestUrlPath(request);

    return request;
  }

  /**
   * @description
   *     Get the specified HTTP request's URL path.
   *
   * @param Drash.Http.Request request
   *     The request object.
   *
   * @return string
   *     Returns the URL path.
   */
  public getHttpRequestUrlPath(request: Drash.Http.Request): string {
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
   * @param Drash.Http.Request request
   *     The request object.
   *
   * @return string
   *     Returns the URL query string (e.g., key1=value1&key2=value2) without
   *     the leading "?" character.
   */
  public getHttpRequestUrlQueryString(request: Drash.Http.Request): string {
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
   * @param Drash.Http.Request request
   *     The request object.
   *
   * @return any
   *     Returns the URL query string in key-value pair format.
   */
  public getHttpRequestUrlQueryParams(request: Drash.Http.Request): any {
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

    for (let key in Drash.Dictionaries.MimeDb) {
      if (!mimeType) {
        if (Drash.Dictionaries.MimeDb[key].extensions) {
          for (let index in Drash.Dictionaries.MimeDb[key].extensions) {
            if (filePath == Drash.Dictionaries.MimeDb[key].extensions[index]) {
              mimeType = key;
            }
          }
        }
      }
    }

    return mimeType;
  }

  /**
   * Parse a URL query string in it's raw form.
   *
   * If the request body's content type is application/json, then 
   * `{"username":"root","password":"alpine"}` becomes `{ username: "root", password: "alpine" }`.
   *
   * If the request body's content type is application/x-www-form-urlencoded,
   * then `username=root&password=alpine` becomes `{ username: "root", password: "alpine" }`.
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
}
