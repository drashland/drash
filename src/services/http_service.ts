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
