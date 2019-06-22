import Drash from "../../mod.ts";
import { STATUS_TEXT, Status } from "../../deno_std.ts";

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
  public body: any = {};

  /**
   * @description
   *     A property to hold the body of this response as a string. This is
   *     implemented to help unit testing efforts.
   *
   * @property string body_generated
   */
  public body_generated: string = "";

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
   *     This class uses `Status` and `STATUS_TEXT` from the Deno Standard
   *     Modules' http_status module for response codes.
   *
   * @property number status_code
   */
  public status_code: number = Status.OK;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * @description
   *     Construct an object of this class.
   *
   * @param Drash.Http.Request request
   */
  constructor(request: Drash.Http.Request) {
    this.request = request;
    this.headers = new Headers();
    this.headers.set("Content-Type", this.getHeaderContentType());
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////

  /**
   * @description
   *     Generate a response.
   *
   * @return any
   */
  public generateResponse(): any {
    switch (this.headers.get("Content-Type")) {
      case "application/json":
        this.body_generated = this.generateJsonResponse();
        break;
      case "text/html":
        this.body_generated = this.generateHtmlResponse();
        break;
      case "application/xml":
      case "text/xml":
        this.body_generated = this.generateXmlResponse();
        break;
      default:
        this.headers.set("Content-Type", "application/json");
        return this.generateResponse();
    }

    return this.body_generated;
  }

  /**
   * @description
   *     Generate an HTML response. The `this.body` property should be the
   *     entire HTML document.
   *
   * @return any
   */
  public generateHtmlResponse(): any {
    return this.body;
  }

  /**
   * @description
   *     Generate a JSON response.
   *
   * @return string
   */
  public generateJsonResponse(): any {
    return JSON.stringify({
      status_code: this.status_code,
      status_message: this.getStatusMessage(),
      request: {
        url: this.request.url,
        method: this.request.method.toUpperCase()
      },
      body: this.body
    });
  }

  /**
   * @description
   *     Generate an XML response.
   *
   * @return any
   */
  public generateXmlResponse(): any {
    return `<response>
  <statuscode>${this.status_code}</statuscode>
  <statusmessage>${this.getStatusMessage()}</statusmessage>
  <body>${this.body}</body>
</response>`;
  }

  /**
   * @description
   *     Get the status message based on the status code.
   *
   * @return string
   *     Returns the status message associated with `this.status_code`. For
   *     example, if the response's `status_code` is `200`, then this method
   *     will return "OK" as the status message.
   */
  public getStatusMessage(): string {
    let message = STATUS_TEXT.get(this.status_code);
    return message ? message : null;
  }

  /**
   * @description
   *     Get the full status message based on the status code. This is just the
   *     status code and the status message together (e.g., `200 (OK)`, `401
   *     (Unauthorized)`, etc.).
   *
   * @return string
   */
  public getStatusMessageFull(): string {
    let message = STATUS_TEXT.get(this.status_code);
    return message ? `${this.status_code} (${message})` : null;
  }

  /**
   * @description
   *     Get the full output details (for debugging purposes).
   *
   * @return string
   */
  public outputDetails(): string {
    return `Content-Type: ${this.headers.get(
      "Content-Type"
    )}. Status: ${this.getStatusMessageFull()}.`;
  }

  /**
   * @description
   *     Send the response to the client making the request.
   *
   * @return Promise<any>
   *     Returns the output which is passed to `Drash.Http.Request.respond()`.
   *     The output is only returned for unit testing purposes. It is not
   *     intended to be used elsewhere as this call is the last call in the
   *     request-resource-response lifecycle.
   */
  public async send(): Promise<any> {
    Drash.core_logger.debug("Awaiting response.generateResponse().");
    let body = await this.generateResponse();
    let output = {
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body)
    };

    Drash.core_logger.debug("Sending response to request.respond().");
    this.request.respond(output);

    Drash.core_logger.debug("Returning output for unit testing purposes.");
    return output;
  }

  /**
   * @description
   *     Send the response of a static asset (e.g., a CSS file, JS file, PDF
   *     file, etc.) to the client making the request.
   *
   *     This method is reliant on the `DRASH_SERVER_DIRECTORY` environment
   *     variable. The `DRASH_SERVER_DIRECTORY` environment variable MUST point
   *     to the parent directory of the directory (or list of directories)
   *     containing static assets. For example, if my project is located at
   *     `/path/to/my/project` and my CSS files are located at
   *     `/path/to/my/project/public/assets`, then `DRASH_SERVER_DIRECTORY`
   *     should be `/path/to/my/project/public`.
   *
   * @return any
   */
  public sendStatic(): any {
    const file = this.request.url_path;
    // Remove trailing slash
    let staticPathParent = Deno.env().DRASH_SERVER_DIRECTORY;
    staticPathParent = staticPathParent.replace(/(\/$)/, "");
    const fullFilepath = `${staticPathParent}${file}`;

    let output = {
      status: this.status_code,
      headers: this.headers,
      body: Deno.readFileSync(fullFilepath)
    };

    this.request.respond(output);

    return output;
  }

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////

  /**
   * @description
   *     Get this response's `Content-Type` header. There are three ways to set
   *     the response's `Content-Type` header from a request: (1) the request's
   *     headers by setting `Response-Content-Type: "type"`, (2) the request's
   *     URL query params by setting `?response_content_type=type`, and the
   *     request's body by setting `{response_content_type: "type"}`.
   *
   *     Setting the content type using the request's body takes precedence over
   *     all other settings.
   *
   *     Setting the content type using the request's URL query params takes
   *     precedence over the header setting and the default setting.
   *
   *     Setting the content type using the request's header setting takes
   *     precedence over the default setting.
   *
   *     If no content type is specified by the request's body, URL query
   *     params, or header, then the default content type will be used. The
   *     default content type is the content type defined in the
   *     `Drash.Http.Server` object's `response_output` config.
   *
   * @return string
   */
  protected getHeaderContentType(): string {
    let contentType = this.request.headers.get("Response-Content-Type-Default");

    // Check the request's headers to see if `response-content-type:
    // {content-type}` has been specified
    contentType = this.request.headers.get("Response-Content-Type")
      ? this.request.headers.get("Response-Content-Type")
      : contentType;

    // Check the request's URL query params to see if
    // ?response_content_type={content-type} has been specified
    contentType = this.request.url_query_params.response_content_type
      ? this.request.url_query_params.response_content_type
      : contentType;

    // Check the request's body to see if
    // {response_content_type: {content-type}} has been specified
    contentType = this.request.body_parsed.response_content_type
      ? this.request.body_parsed.response_content_type
      : contentType;

    return contentType;
  }
}
