import { Drash } from "../../mod.ts";
import {
  MultipartReader,
} from "../../deps.ts";

/**
 * @memberof Drash.Services
 * @class HttpService
 *
 * @description
 *     This class helps perform HTTP-related processes.
 */
export class HttpService {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
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
  public accepts(
    request: Drash.Http.Request,
    type: string | string[],
  ): boolean | string {
    const acceptHeader = request.headers.get("Accept");

    if (!acceptHeader) {
      return false;
    }

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
  public getMimeType(filePath: string | undefined, fileIsUrl: boolean = false):
    | null
    | string {
    let mimeType = null;

    if (fileIsUrl) {
      filePath = filePath ? filePath.split("?")[0] : undefined;
    }

    if (filePath) {
      let fileParts = filePath.split(".");
      filePath = fileParts.pop();

      // deno-lint-ignore no-explicit-any
      const database: any = Drash.Dictionaries.MimeDb;

      for (let key in database) {
        if (!mimeType) {
          if (database[key].extensions) {
            for (let index in database[key].extensions) {
              if (filePath == database[key].extensions[index]) {
                mimeType = key;
              }
            }
          }
        }
      }
    }

    return mimeType;
  }
}
