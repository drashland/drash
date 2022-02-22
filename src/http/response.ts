import { Cookie, deleteCookie, setCookie } from "../../deps.ts";
import { mimeTypes } from "../dictionaries/mime_types.ts";
import * as Drash from "../../mod.ts";

export class DrashResponse {
  body: BodyInit | null = null;
  public headers: Headers = new Headers();
  public status = 200;
  public statusText = "OK";
  public upgraded = false;
  public upgraded_response: Response | null = null;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Delete a cookie for the response.
   *
   * @param name - The name of the cookie.
   * @param attributes - Path and domain, can be used to pass the exact same
   * attributes that were used to set the cookie.
   */
  public deleteCookie(
    name: string,
    attributes?: {
      domain: string;
      path?: string;
    },
  ): void {
    deleteCookie(this.headers, name, attributes);
  }

  /**
   * Set the body of this response as a downloaded type given the filepath,
   * filename, and content type of the downloadable type.
   *
   * @param filepath - The filepath of the file to download, relative to the CWD
   * that executed the entrypoint script.
   * @param contentType - The content type of the associated file.
   * @param headers - Any extra headers you wish to specify apart of the content-type header
   *
   * @example
   * ```js
   * response.download(
   *   "./images/user_1_profile_pic.png",
   *   "image/png"
   * );
   * ```
   */
  public download(
    filepath: string,
    contentType: string,
    headers: Record<string, string> = {},
  ): void {
    const filepathSplit = filepath.split("/");
    const filename = filepathSplit[filepathSplit.length - 1];
    this.headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    this.headers.set("Content-Type", contentType);
    Object.keys(headers).forEach((key) => {
      this.headers.set(key, headers[key]);
    });
    this.body = Deno.readFileSync(filepath);
  }

  /**
   * Set the body of this response as the contents of the given filepath. The
   * Content-Type header will be set automatically based on the extension of the
   * filepath.
   *
   * @param filepath - The filepath of the file to download, relative to the CWD
   * that executed the entrypoint script.
   * @param status - The status ot respond with.
   * @param headers - Any extra headers you wish to specify apart of the content-type header
   */
  public file(
    filepath: string,
    status?: number,
    headers: Record<string, string> = {},
  ): void {
    // Get the extension of the file
    const extension = filepath.split(".").at(-1);
    if (!extension) {
      throw new Drash.Errors.HttpError(
        415,
        "`filepath` passed into response.file()` must contain a valid extension.",
      );
    }

    // Get the MIME type of the file
    const type = mimeTypes.get(extension);
    if (!type) {
      throw new Drash.Errors.HttpError(
        500,
        "Unable to retrieve content type for " + filepath +
          ", please submit an issue.",
      );
    }

    this.body = Deno.readFileSync(filepath);
    this.headers.set("Content-Type", type);
    Object.keys(headers).forEach((key) => {
      this.headers.set(key, headers[key]);
    });
    if (status) {
      this.status = status;
    }
  }

  /**
   * Set the body of this response as HTML.
   *
   * @param html - The HTML string to assign to the body.
   * @param status - Status to respond with.
   * @param headers - Any extra headers you wish to specify apart of the content-type header.
   */
  public html(
    html: string,
    status?: number,
    headers: Record<string, string> = {},
  ): void {
    this.body = html;
    this.headers.set("Content-Type", "text/html");
    if (status) {
      this.status = status;
    }
    Object.keys(headers).forEach((key) => {
      this.headers.set(key, headers[key]);
    });
  }

  /**
   * Set the body of this response as JSON.
   *
   * @param json - The object to assign to the body.
   * @param status - The status to respond with.
   * @param headers - Any extra headers you wish to specify apart of the content-type header
   */
  public json(
    // We ignore the following because this means a user can do
    // `const user: IUSer = ...; response.json(user)`, which isn't possible with
    // Record<string, unknown>
    // deno-lint-ignore ban-types
    json: object,
    status?: number,
    headers: Record<string, string> = {},
  ) {
    this.body = JSON.stringify(json);
    this.headers.set("Content-Type", "application/json");
    Object.keys(headers).forEach((key) => {
      this.headers.set(key, headers[key]);
    });
    if (status) this.status = status;
  }

  /**
   * Set the body of this response as XML.
   *
   * @param xml - The XML string to assign to the body.
   * @param status - The status to respond with.
   * @param headers - Any extra headers you wish to specify apart of the content-type header
   */
  public xml(
    xml: string,
    status?: number,
    headers: Record<string, string> = {},
  ) {
    this.body = xml;
    this.headers.set("Content-Type", "text/xml");
    Object.keys(headers).forEach((key) => {
      this.headers.set(key, headers[key]);
    });
    if (status) this.status = status;
  }

  /**
   * This method allows users to make `this.response.render()` calls in
   * resources. This method is also used by Tengine:
   *
   *   https://github.com/drashland/deno-drash-middleware/tree/master/tengine
   */
  public render(_filepath: string, _data: unknown): boolean | string {
    return false;
  }

  /**
   * Set a cookie on the response to be handled by the client.
   *
   * @param cookie The cookie data.
   */
  public setCookie(cookie: Cookie): void {
    setCookie(this.headers, cookie);
  }

  /**
   * Set thie body of this response.
   *
   * @param contentType - The content type to use in the Content-Type header.
   * @param body - The body of the response.
   */
  public send<T extends BodyInit>(contentType: string, body: T): void {
    this.body = body;
    this.headers.set("Content-Type", contentType);
  }

  /**
   * Set the body of this response as text.
   *
   * @param text - The text to assign to the body.
   * @param status - The status to respond with.
   * @param headers - Any extra headers you wish to specify apart of the content-type header
   */
  public text(
    text: string,
    status?: number,
    headers: Record<string, string> = {},
  ) {
    this.body = text;
    this.headers.set("Content-Type", "text/plain");
    Object.keys(headers).forEach((key) => {
      this.headers.set(key, headers[key]);
    });
    if (status) this.status = status;
  }

  /**
   * Upgrade the response.
   *
   * @param response - The upgraded response (e.g. a WebSocket connection
   * response via Deno.upgradeWebSocket()).
   */
  public upgrade(response: Response): void {
    this.upgraded = true;
    this.upgraded_response = response;
  }
}
