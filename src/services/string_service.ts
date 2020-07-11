/**
 * This class helps perform string-related processes like string
 * transformations, reading, and replacing.
 */
export class StringService {
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
  static parseQueryParamsString(
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
}
