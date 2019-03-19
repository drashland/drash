// namespace Drash.Services

import Drash from "../../mod.ts";
import DrashHttpRequest from "../http/request.ts";

/**
 * @class HttpService
 * This class helps perform HTTP-related processes.
 */
class HttpService {
  /**
   * Hydrate the request with data that is useful for the `Drash.Http.Server`
   * class.
   *
   * @param Drash.Http.Request request
   *     The request object.
   * @param any options
   *     A list of options:
   *     {
   *       headers: {}
   *     }
   */
  public hydrateHttpRequest(request: DrashHttpRequest, options?: any) {
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
   * Get the specified HTTP request's URL path.
   *
   * @param Drash.Http.Request request
   *     The request object.
   *
   * @return string
   *     Returns the URL path.
   */
  public getHttpRequestUrlPath(request: DrashHttpRequest): string {
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
   * Get the specified HTTP request's URL query string.
   *
   * @param Drash.Http.Request request
   *     The request object.
   *
   * @return string
   *     Returns the URL query string (e.g., key1=value1&key2=value2) without
   *     the leading "?" character.
   */
  public getHttpRequestUrlQueryString(request: DrashHttpRequest): string {
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
   * Get the HTTP request's URL query params by parsing the URL query string.
   *
   * @param Drash.Http.Request request
   *     The request object.
   *
   * @return any
   *     Returns the URL query string in key-value pair format.
   */
  public getHttpRequestUrlQueryParams(request: DrashHttpRequest): any {
    let queryParams = {};

    try {
      let queryParamsString = request.url.split("?")[1];

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
    } catch (error) {}

    return queryParams;
  }

  /**
   * Get a MIME type for a file based on its extension.
   *
   * @param any file
   */
  public getMimeType(file: string, fileIsUrl: boolean = false) {
    let mimeType = null;

    if (fileIsUrl) {
      file = file.split("?")[0];
    }

    let fileParts = file.split(".");
    file = fileParts.pop();

    for (let key in Drash.Dictionaries.MimeDb) {
      if (!mimeType) {
        if (Drash.Dictionaries.MimeDb[key].extensions) {
          for (let index in Drash.Dictionaries.MimeDb[key].extensions) {
            if (file == Drash.Dictionaries.MimeDb[key].extensions[index]) {
              mimeType = key;
            }
          }
        }
      }
    }

    return mimeType;
  }
}

export default new HttpService();
