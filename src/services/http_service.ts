import Drash from "../../mod.ts";
/**
 * Hydrate the request with data that is useful for the Drash.Http.Server class.
 *
 * @param ServerRequest request
 *     The request object.
 * @param object options
 *     A list of options:
 *     {
 *       headers: {}
 *     }
 */
export function hydrateHttpRequest(request, options?) {
  if (options) {
    if (options.headers) {
      for (let key in options.headers) {
        request.headers.set(key, options.headers[key]);
      }
    }
  }

  request.url_query_params = getHttpRequestUrlQueryParams(request);

  return request;
}

/**
 * Get the request's query params from by parsing its URL.
 *
 * @param ServerRequest request
 *     The request object.
 */
export function getHttpRequestUrlQueryParams(request) {
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
      kvpString = kvpString.split("=");
      queryParams[kvpString[0]] = kvpString[1];
    });
  } catch (error) {}

  return queryParams;
}

/**
 * Get a MIME type for a file based on its extension.
 */
export function getMimeType(file: any, fileIsUrl?: boolean) {
  let mimeType = null;

  if (fileIsUrl) {
    file = file.split("?")[0];
  }

  file = file.split(".");
  file = file[file.length - 1];

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
