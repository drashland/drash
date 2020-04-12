import Drash from "../../mod.ts";
import { STATUS_TEXT, Status } from "../../deps.ts";
import { setCookie, delCookie, Cookie } from "../../deps.ts";
import { ResponseOptions } from "../interfaces/response_options.ts";

/**
 * @memberof Drash.Http
 * @class Response
 *
 * @description
 *     Response handles sending a response to the client making the request.
 */
export default class Response {
  /**
   * @description
   *     A property to hold the body of this response.
   *
   * @property any body
   */
  public body: any = "";

  /**
   * @description
   *     A property to hold this response's headers.
   *
   * @property Headers headers
   */
  public headers: Headers;

  /**
   * @description
   *     The request object.
   *
   * @property ServerRequest request
   */
  public request: any;

  /**
   * @description
   *     A property to hold this response's status code (e.g., 200 for OK).
   *     This class uses Status and STATUS_TEXT from the Deno Standard
   *     Modules' http_status module for response codes.
   *
   * @property number status_code
   */
  public status_code: number = Status.OK;

  /**
   * @description
   *     A property to hold the path to the users views directory
   *     from their project root
   *
   * @property string views_path
   */
  private views_path: string | undefined;

  /**
   * @description
   *     The render method extracted from dejs
   *
   * @property any views_renderer
   */
  private renderer: any = null;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * @description
   *     Construct an object of this class.
   *
   * @param any request
   *
   * @param ResponseOptions options
   *     See Drash.Interfaces.ResponseOptions
   */
  constructor(request: any, options: ResponseOptions = {}) {
    this.request = request;
    this.headers = new Headers();
    if (options.views_renderer) {
      this.renderer = options.views_renderer;
      this.views_path = options.views_path; // if there's a views renderer, then there must be a views path
    }
    this.headers.set("Content-Type", request.response_content_type);
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////

  /**
   * @description
   *     Read and return the contents of a .html or dejs view file.
   *     Can accept data to populate the view with dynamic data.
   *     Will use the views_path property to find the requested view name
   *
   * @param any args
   *
   * @example
   *     const content = await this.response.render('/users/add.html', { name: 'Drash' })
   *     if (!content) throw new Error(...)
   *     this.response.body = content
   *
   * @return string|boolean
   *     The html content of the view, or false if the `views_path` or
   *     `views_renderer` within your server object is not set
   */
  public async render (...args: any): Promise<string|boolean> {
    if (!this.views_path || !this.renderer) {
      return false
    }
    args[0] = this.views_path += args[0];

    // IF DEJS CANT POPULATE DYANMIC DATA INSIDE A HTML FILE
    // const fileContentsRaw = Deno.readFileSync(args[0]);
    // const decoder = new TextDecoder();
    // let decoded = decoder.decode(fileContentsRaw);
    // if (args[0].slice(-5) === '.html') {
    //   Object.keys(args[1]).forEach((propName: string, index: number) => {
    //     const regex = new RegExp("\{\{ " + propName + " \}\}");
    //     decoded = decoded.replace(regex, args[index][propName])
    //   })
    //   return decoded
    // }
    // if (args[0].slice(-4) === '.ejs') {
    //   if (!this.renderer) {
    //     throw new Error('No renderer exists. Unable to return a HTML response.')
    //   }
    //   const tpl = await this.renderer(decoded, { name: 'world'});
    //   return tpl
    // }

    return await this.renderer(...args)
  }

  /**
   * @description
   *     Create a cookie to be sent in the response.
   *     Note: Once set, it cannot be read until the next
   *     request
   * 
   * @param Cookie cookie
   *     Object holding all the properties for a cookie object
   * 
   * @return void
   */
  public setCookie(cookie: Cookie): void {
    setCookie(this, cookie);
  }

  /**
   * @description
   *     Delete a cookie before sending a response
   * 
   * @param string cookieName 
   *     The cookie name to delete
   * 
   * @return void
   */
  public delCookie(cookieName: string): void {
    delCookie(this, cookieName);
  }

  /**
   * @description
   *     Generate a response.
   *
   * @return any
   */
  public generateResponse(): any {
    let contentType = this.headers.get("Content-Type");

    switch (contentType) {
      case "application/json":
        return JSON.stringify(this.body);
      case "application/xml":
      case "text/html":
      case "text/xml":
      case "text/plain":
      default:
        return this.body;
    }

    this.body = `Response Content-Type "${contentType}" unknown.`;
    this.status_code = 400;

    return this.body;
  }

  /**
   * @description
   *     Get the status message based on the status code.
   *
   * @return null|string
   *     Returns the status message associated with this.status_code. For
   *     example, if the response's status_code is 200, then this method
   *     will return "OK" as the status message.
   */
  public getStatusMessage(): null | string {
    let message = STATUS_TEXT.get(this.status_code);
    return message ? message : null;
  }

  /**
   * @description
   *     Get the full status message based on the status code. This is just the
   *     status code and the status message together. For example:
   *
   *         If the status code is 200, then this will return "200 (OK)"
   *         If the status code is 404, then this will return "404 (Not Found)"
   *
   * @return null|string
   */
  public getStatusMessageFull(): null | string {
    let message = STATUS_TEXT.get(this.status_code);
    return message ? `${this.status_code} (${message})` : null;
  }

  /**
   * @description
   *     Send the response to the client making the request.
   *
   * @return Promise<any>
   *     Returns the output which is passed to `request.respond()`. The output
   *     is only returned for unit testing purposes. It is not intended to be
   *     used elsewhere as this call is the last call in the
   *     request-resource-response lifecycle.
   */
  public async send(): Promise<any> {
    let body = await this.generateResponse();
    let output = {
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body),
    };
    return this.request.respond(output);
  }

  /**
   * @description
   *     Send the response of a static asset (e.g., a CSS file, JS file, PDF
   *     file, etc.) to the client making the request.
   *
   * @param null|string file
   *     The file that will be served to the client.
   *
   * @return {status: number, headers: Headers, body: any}
   */
  public sendStatic(file: null | string, contents: null | Uint8Array = null): {
    status: number;
    headers: Headers;
    body: any;
  } {
    let output = {
      status: this.status_code,
      headers: this.headers,
      body: file ? Deno.readFileSync(file) : contents,
    };

    this.request.respond(output);

    return output;
  }

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////

  /**
   * @description
   *     Redirect the client to another URL.
   *
   * @param number httpStatusCode
   *     Response's status code.
   *     Permanent: (301 and 308)
   *     Temporary: (302, 303, and 307)
   *
   * @param string location
   *     URL of desired redirection.
   *     Relative or external paths (e.g., "/users/1", https://drash.land)
   * 
   * @return {status: number, headers: Headers, body: any}
   */
  public redirect(httpStatusCode: number, location: string) {
    this.status_code = httpStatusCode;
    this.headers.set("Location", location);

    let output = {
      status: this.status_code,
      headers: this.headers,
    };
    return this.request.respond(output);
  }
}
