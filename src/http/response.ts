import { Drash } from "../../mod.ts";
import { STATUS_TEXT, Status } from "../../deps.ts";
import { setCookie, delCookie, Cookie } from "../../deps.ts";
const decoder = new TextDecoder();

/**
 * @memberof Drash.Http
 * @class Response
 *
 * @description
 *     Response handles sending a response to the client making the request.
 */
export class Response {
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
  private template_engine: boolean | undefined = false;

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
  constructor(request: any, options: Drash.Interfaces.ResponseOptions = {}) {
    this.request = request;
    this.headers = new Headers();
    this.template_engine = options.template_engine;
    this.views_path = options.views_path;
    this.headers.set("Content-Type", request.response_content_type);
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////

  /**
   * @description
   *     Render html files. Can be used with Drash's template engine or basic
   *     HTML files. This method will read a file based on the `views_path`
   *     and filename passed in. When called, will set the response content
   *     type to "text/html"
   *
   * @param any args
   *
   * @example
   *     // if `views_path` is "/public/views",
   *     // file to read is "/public/views/users/add.html"
   *     const content = this.response.render('/users/add.html', { name: 'Drash' })
   *     if (!content) throw new Error(...)
   *     this.response.body = content
   *
   * @return string|boolean
   *     The html content of the view, or false if the `views_path` is not set.
   */
  public render(...args: any): string | boolean {
    if (!this.views_path) {
      return false;
    }

    const data = args.length >= 2 ? args[1] : null;
    this.headers.set("Content-Type", "text/html");

    if (this.template_engine) {
      const engine = new Drash.Compilers.TemplateEngine(this.views_path);
      return engine.render(args[0], data);
    }

    const filename = this.views_path += args[0];
    const fileContentsRaw = Deno.readFileSync(filename);
    let decoded = decoder.decode(fileContentsRaw);
    return decoded;
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
