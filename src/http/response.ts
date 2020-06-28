import { Drash } from "../../mod.ts";
import { STATUS_TEXT, Status } from "../../deps.ts";
import { setCookie, deleteCookie, Cookie } from "../../deps.ts";
const decoder = new TextDecoder();

/**
 * @interface IResponseOptions
 *
 * @description
 *     views_path?: string
 *
 *         A string that contains the path to the views directory from
 *         your project directory. This must exist if the `views_renderer` property
 *         is set by you. Only needs to be set if you plan to return HTML
 *
 *           const server = new Drash.Http.Server({
 *             ...,
 *             views_path: "/public/views"
 *           })
 *
 *     template_engine?: boolean
 *
 *         True if you wish to use Drash's own template engine to render html files.
 *         The `views_path` property must be set if this is set to true
 *
 *             const server = new Drash.Http.Server({
 *               ...
 *               template_engine: true
 *             })
 */
export interface IResponseOptions {
  views_path?: string;
  template_engine?: boolean;
  default_response_content_type?: string;
}

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
   * @property string body
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
   * @property Drash.Http.Request request
   */
  public request: Drash.Http.Request;

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
   *     An object of options to help determine how this object should behave.
   *
   * @property IResponseOptions options
   */
  private options: IResponseOptions;

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
   * @property boolean | undefined views_renderer
   */
  private readonly template_engine: boolean | undefined = false;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////

  /**
   * @description
   *     Construct an object of this class.
   *
   * @param Drash.Http.Request request
   *
   * @param IResponseOptions options
   */
  constructor(
    request: Drash.Http.Request,
    options: IResponseOptions = {},
  ) {
    this.options = options;
    this.request = request;
    this.headers = new Headers();
    this.template_engine = options.template_engine;
    this.views_path = options.views_path;
    this.headers.set(
      "Content-Type",
      this.getContentTypeFromRequestAcceptHeader(),
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   *     Render html files. Can be used with Drash's template engine or basic
   *     HTML files. This method will read a file based on the `views_path`
   *     and filename passed in. When called, will set the response content
   *     type to "text/html"
   *
   * @param unknown args
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
  public render(
    // deno-lint-ignore no-explicit-any
    ...args: any
  ): string | boolean {
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
    deleteCookie(this, cookieName);
  }

  /**
   * @description
   *     Generate a response.
   *
   * @return string
   */
  public generateResponse(): string {
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
   * @return Promise<Drash.Interfaces.ResponseOutput>
   *     Returns the output which is passed to `request.respond()`. The output
   *     is only returned for unit testing purposes. It is not intended to be
   *     used elsewhere as this call is the last call in the
   *     request-resource-response lifecycle.
   */
  public async send(): Promise<Drash.Interfaces.ResponseOutput> {
    let body = await this.generateResponse();
    let output: Drash.Interfaces.ResponseOutput = {
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body),
    };

    this.request.respond(output);

    output.status_code = this.status_code;
    return output;
  }

  /**
   * @description
   *     Send the response of a static asset (e.g., a CSS file, JS file, PDF
   *     file, etc.) to the client making the request.
   *
   * @param null|string file
   *     The file that will be served to the client.
   * @param null|Uint8Array contents
   *     TODO Add description
   *
   * @return Drash.Interfaces.ResponseOutput
   */
  public sendStatic(
    file: null | string,
    contents: Uint8Array | string = "",
  ): Drash.Interfaces.ResponseOutput {
    let output: Drash.Interfaces.ResponseOutput = {
      status: this.status_code,
      headers: this.headers,
      body: file ? Deno.readFileSync(file) : contents,
    };

    this.request.respond(output);

    output.status_code = this.status_code;
    return output;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   *     Get the content type from the request object's "Accept" header. Default
   *     to the response_output config passed in when the server was created if
   *     no accept header is specified. If no response_output config was passed
   *     in during server creation, then default to application/json.
   *
   *
   * @return string
   *     Returns a content type to set as this object's content-type header. If
   *     multiple content types are passed in, then return the first accepted
   *     content type.
   */
  protected getContentTypeFromRequestAcceptHeader(): string {
    const accept = this.request.headers.get("Accept") ||
      this.request.headers.get("accept");
    if (accept) {
      try {
        let contentTypes = accept.split(";")[0].trim();
        if (contentTypes && contentTypes == "*/*") {
          return "application/json";
        }
        if (contentTypes.includes(",")) {
          let firstType = contentTypes.split(",")[0].trim();
          if (firstType == "*/*") {
            return "application/json";
          }
          return firstType;
        }
      } catch (error) {
        // Do nothing... fall through down to the contentType stuff below
      }
    }

    let contentType = "application/json"; // default to application/json
    if (this.options) {
      contentType = this.options.default_response_content_type ??
        contentType;
    }

    return contentType;
  }

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
  public redirect(
    httpStatusCode: number,
    location: string,
  ): Drash.Interfaces.ResponseOutput {
    this.status_code = httpStatusCode;
    this.headers.set("Location", location);

    let output: Drash.Interfaces.ResponseOutput = {
      status: this.status_code,
      headers: this.headers,
      body: "",
    };

    this.request.respond(output);

    output.status_code = this.status_code;
    return output;
  }
}
