import Drash from "../../mod.ts";
import { STATUS_TEXT, Status } from "../../deps.ts";

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
  public request;

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
   * @param ServerRequest request
   */
  constructor(request) {
    this.request = request;
    this.headers = new Headers();
    this.headers.set("Content-Type", request.response_content_type);
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////

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
        return this.body;
    }

    throw new Drash.Exceptions.HttpResponseException(
      400,
      `Response Content-Type "${contentType}" unknown.`
    );
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
      body: new TextEncoder().encode(body)
    };

    return this.request.respond(output);
  }

  /**
   * @description
   *     Send the response of a static asset (e.g., a CSS file, JS file, PDF
   *     file, etc.) to the client making the request.
   *
   * @param string file
   *     The file that will be served to the client.
   *
   * @return any
   */
  public sendStatic(file): any {
    let output = {
      status: this.status_code,
      headers: this.headers,
      body: Deno.readFileSync(file)
    };

    this.request.respond(output);

    return output;
  }

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////
}
