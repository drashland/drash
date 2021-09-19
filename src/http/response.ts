import { Cookie, setCookie, deleteCookie } from "../../deps.ts"

export class DrashResponse {

  public body: BodyInit | null = null;
  public headers: Headers = new Headers();
  public status: number = 200;
  public statusText: string = "OK";

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(defaultResponseContentType: string) {
    this.headers.set("Content-Type", defaultResponseContentType);
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
}
