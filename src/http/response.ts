import { Cookie, setCookie, deleteCookie } from "../../deps.ts"

export class DrashResponse {

  public body: BodyInit | null = null;
  public headers: Headers = new Headers();
  public status: number = 200;
  public statusText: string = "OK";
  readonly #respondWith: (r: Response | Promise<Response>) => Promise<void>

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(defaultResponseContentType: string, respondWith: (r: Response | Promise<Response>) => Promise<void>) {
    this.headers.set("Content-Type", defaultResponseContentType);
    this.#respondWith = respondWith
  }

  /**
   * Set a cookie on the response to be set when sent to the client
   * 
   * @param cookie The cookie data
   */
  public setCookie(cookie: Cookie): void {
    setCookie(this.headers, cookie)
  }

  /**
   * Delete a cookie for the response
   * 
   * @param name The name of the cookie
   * @param attributes Path and domain, can be used to pass the exact same attributes that were used to set the cookie
   */
  public delCookie(name: string, attributes?: {
    path?: string, domain: string
  }): void {
    deleteCookie(this.headers, name, attributes)
  }

  public send() {
    this.#respondWith(new Response(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
    }));
  }

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
