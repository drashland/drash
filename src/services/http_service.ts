import { Drash } from "../../mod.ts";
import { MultipartReader } from "../../deps.ts";

/**
 * This class helps perform HTTP-related processes.
 */
export class HttpService {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

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
  public accepts(
    request: Drash.Http.Request,
    type: string | string[],
  ): boolean | string {
    let acceptHeader = request.headers.get("Accept");

    if (!acceptHeader) {
      acceptHeader = request.headers.get("accept");
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

      const database = Drash.Dictionaries.MimeDb;

      for (let key in database) {
        if (!mimeType) {
          const extensions = database[key].extensions;
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
}
