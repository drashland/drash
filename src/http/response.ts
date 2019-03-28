// namespace Drash.Http

import Drash from "../../mod.ts";
import DrashHttpRequest from "./request.ts";
import { Status, STATUS_TEXT } from "https://deno.land/x/http/http_status.ts";

/**
 * @class Response
 * Response handles sending a response to the client making the request.
 */
export default class Response {

  /**
   * The body of this response.
   *
   * @property any body
   *
   * @examplecode [
   *   {
   *     "title": "app.ts",
   *     "filepath": "/api_reference/http/response/p_body.ts",
   *     "language": "typescript",
   *     "line_highlight": "6"
   *   }
   * ]
   */
  public body: any = {};

  /**
   * The body of this response as a string.
   *
   * @property string body_generated
   */
  public body_generated: string = "";

  /**
   * This response's headers.
   *
   * @property Headers headers
   */
  public headers: Headers;

  /**
   * The request object.
   *
   * @property Drash.Http.Request request
   */
  public request: DrashHttpRequest;

  /**
   * This response's status code (e.g., 200 for OK). _Drash.Http.Response_
   * objects use _Status_ and _STATUS_TEXT_ from [https://deno.land/x/http/http_status.ts](https://deno.land/x/http/http_status.ts).
   *
   * @property number status_code
   */
  public status_code: number = Status.OK;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param Drash.Http.Request request
   */
  constructor(request: DrashHttpRequest) {
    this.request = request;
    this.headers = new Headers();
    this.headers.set("Content-Type", this.getHeaderContentType());
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////

  /**
   * Generate a response.
   *
   * @return string
   */
  public generateResponse(): string {
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
   * Get the status message based on the status code.
   *
   * @return string
   *     Returns the status message associated with `this.status_code`. For
   *     example, if the response's `status_code` is `200`, then this method
   *     will return "OK" as the status message.
   *
   * @examplecode [
   *   {
   *     "title": "app.ts",
   *     "filepath": "/api_reference/http/response/m_getStatusMessage.ts",
   *     "language": "typescript",
   *     "line_highlight": "8"
   *   }
   * ]
   */
  public getStatusMessage(): string {
    let message = STATUS_TEXT.get(this.status_code);
    return message ? message : null;
  }

  /**
   * Get the full status message based on the status code. This is just the
   * status code and the status message together (e.g., `200 (OK)`, `401
   * (Unauthorized)`, etc.).
   *
   * @return string
   */
  public getStatusMessageFull(): string {
    let message = STATUS_TEXT.get(this.status_code);
    return message ? `${this.status_code} (${message})` : null;
  }

  /**
   * Send the response to the client making the request.
   *
   * @return any
   *     Returns the output which is passed to `Drash.Http.Request.respond()`.
   *     The output is only returned for unit testing purposes. It is not
   *     intended to be used elsewhere as this call is the last call in the
   *     request-resource-response lifecycle.
   */
  public send(): any {
    let body = this.generateResponse();
    let output = {
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body)
    };

    this.request.respond(output);

    return output;
  }

  /**
   * Send the response of a "static asset" to the client making the request.
   *
   * @return any
   */
  public sendStatic(): any {
    const file = this.request.url_path;
    const fullFilepath = `/var/www/deno-drash/docs/${file}`;

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
   * Generate an HTML response. The `this.body` property should be the entire
   * HTML document.
   *
   * @return string
   */
  protected generateHtmlResponse(): string {
    return this.body;
  }

  protected generateJsonResponse(): string {
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

  protected generateXmlResponse(): string {
    return `<response>
  <statuscode>${this.status_code}</statuscode>
  <statusmessage>${this.getStatusMessage()}</statusmessage>
  <body>${this.body}</body>
</response>`;
  }

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

    // TODO(crookse) Check request body

    return contentType;
  }
}
