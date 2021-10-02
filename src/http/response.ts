import { Cookie, deleteCookie, setCookie } from "../../deps.ts";
import { mimeTypes } from "../dictionaries/mime_types.ts";
import * as Drash from "../../mod.ts";

export class DrashResponse {
  body: BodyInit | null = null;
  public headers: Headers = new Headers();
  public status = 200;
  public statusText = "OK";

  /**
   * Set a cookie on the response to be set when sent to the client
   *
   * @param cookie The cookie data
   */
  public setCookie(cookie: Cookie): void {
    setCookie(this.headers, cookie);
  }

  /**
   * Delete a cookie for the response
   *
   * @param name The name of the cookie
   * @param attributes Path and domain, can be used to pass the exact same attributes that were used to set the cookie
   */
  public delCookie(name: string, attributes?: {
    path?: string;
    domain: string;
  }): void {
    deleteCookie(this.headers, name, attributes);
  }

  /**
   * Used when the resource will respond with JSON. Sets the body
   * and content type appropriately
   *
   * @param json The object to assign to the body
   */
  // Because this means a user can do `const user: IUSer = ...; response.json(user)`, which isn't possible with Record<string, unknown>
  // deno-lint-ignore ban-types
  public json(json: object) {
    this.body = JSON.stringify(json);
    this.headers.set("content-type", "application/json");
  }

  /**
   * Used when wanting to send plain text to the client
   *
   * @param text The text to assign to the body
   */
  // Because the user can pass whatever they want
  // deno-lint-ignore no-explicit-any
  public text(text: any) {
    this.body = text;
    this.headers.set("content-type", "text/plain");
  }

  /**
   * Used to set a raw HTML string as the body, and sets the content type
   * appropriately
   *
   * @param html The html string to set to the body
   */
  public html(html: string) {
    this.body = html;
    this.headers.set("content-type", "text/html");
  }

  /**
   * Set the contents of a file by the filepath as the body.
   * Sets the content type header appropriately
   *
   * @param path The path relative to your cwd
   */
  public file(path: string): void {
    const ext = path.split(".").at(-1);
    if (!ext) {
      throw new Drash.Errors.HttpError(
        415,
        "`path` passed into response.file()` must contain a valid extension.",
      );
    }
    const type = mimeTypes.get(ext);
    if (!type) {
      throw new Drash.Errors.HttpError(
        500,
        "Unable to retrieve content type for " + path +
          ", please submit an issue.",
      );
    }
    this.body = Deno.readTextFileSync(path);
    this.headers.set("content-type", type);
  }

  /**
   * Used to respond with XML. Sets the content type header appropriately
   *
   * @param xml The xml string to assign to the body
   */
  public xml(xml: string) {
    this.body = xml;
    this.headers.set("content-type", "text/xml");
  }

  // TODO :: Add download method

  /**
   * This method allows users to make `this.response.render()` calls in
   * resources. This method is also used by Tengine:
   *
   *   https://github.com/drashland/deno-drash-middleware/tree/master/tengine
   */
  public render(
    ..._args: unknown[]
  ): Promise<boolean | string> | boolean | string {
    return false;
  }
}
