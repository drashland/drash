import { Drash } from "../../mod.ts";
import {
  Cookie,
  deleteCookie,
  encoder,
  setCookie,
  Status,
  STATUS_TEXT,
} from "../../deps.ts";

export interface IOptions {
  default_content_type?: string;
}

/**
 * Response handles sending a response to the client making the request.
 */
export class Response {
  /**
   * A property to hold the body of this response.
   */
  public body: boolean | null | object | string | undefined = "";

  /**
   * A property to hold this response's headers.
   */
  public headers: Headers;

  /**
   * The request object.
   */
  public request: Drash.Http.Request;

  /**
   * A property to hold this response's status code (e.g., 200 for OK).
   * This class uses Status and STATUS_TEXT from the Deno Standard
   * Modules' http_status module for response codes.
   */
  public status_code: number = Status.OK;

  /**
   * An object of options to help determine how this object should behave.
   */
  protected options: IOptions;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param request - Contains the request object
   *
   * @param options - The response options
   */
  constructor(request: Drash.Http.Request, options: IOptions = {}) {
    this.options = options;
    this.request = request;
    this.headers = new Headers();
    this.headers.set("Content-Type", this.getContentType());
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * This method allows users to make `this.response.render()` calls in
   * resources. This method is also used by Tengine:
   *
   *   https://github.com/drashland/deno-drash-middleware/tree/master/tengine
   */
  public render(
    ...args: unknown[]
  ): Promise<boolean | string> | boolean | string {
    return false;
  }

  /**
   * Create a cookie to be sent in the response. Note: Once set, it cannot be
   * read until the next request
   *
   * @param cookie - Object holding all the properties for a cookie object
   */
  public setCookie(cookie: Cookie): void {
    let response = {
      status: this.status_code,
      // The setCookie() method doesn't care what the body is. It only cares
      // about the response's headers. Our bodie is not assignable to the body
      // that the deleteCookie() method expects. Therefore, we just send in a
      // random body that matches the schema it expects.
      body: "",
      headers: this.headers,
    };
    setCookie(response, cookie);
  }

  /**
   * Delete a cookie before sending a response
   *
   * @param cookieName - The cookie name to delete
   */
  public delCookie(cookieName: string): void {
    let response = {
      status: this.status_code,
      // The deleteCookie() method doesn't care what the body is. It only cares
      // about the response's headers. Our bodie is not assignable to the body
      // that the deleteCookie() method expects. Therefore, we just send in a
      // random body that matches the schema it expects.
      body: "",
      headers: this.headers,
    };
    deleteCookie(response, cookieName);
  }

  /**
   * Generate a response.
   *
   * @returns The response in string form.
   */
  public generateResponse(): string {
    let contentType = this.headers.get("Content-Type");

    switch (contentType) {
      case "application/json":
        return this.body ? JSON.stringify(this.body) : "";
      case "application/xml":
      case "text/html":
      case "text/xml":
      case "text/plain":
      default:
        if (this.body === null) {
          return "null";
        }
        if (this.body === undefined) {
          return "undefined";
        }
        if (typeof this.body === "boolean") {
          return this.body.toString();
        }
        if (typeof this.body !== "string") {
          // final catch all, respond with a generic value
          return "null";
        }
        return this.body;
    }
  }

  /**
   * Get the status message based on the status code.
   *
   * @returns The status message associated with this.status_code. For example,
   * if the response's status_code is 200, then this method will return "OK" as
   * the status message.
   */
  public getStatusMessage(): null | string {
    let message = STATUS_TEXT.get(this.status_code);
    return message ? message : null;
  }

  /**
   * Get the full status message based on the status code. This is just the
   * status code and the status message together. For example:
   *
   * - If the status code is 200, then this will return "200 (OK)"
   * - If the status code is 404, then this will return "404 (Not Found)"
   *
   * @returns The status code
   */
  public getStatusMessageFull(): null | string {
    let message = STATUS_TEXT.get(this.status_code);
    return message ? `${this.status_code} (${message})` : null;
  }

  /**
   * Redirect the client to another URL.
   *
   * @param httpStatusCode - Response's status code.
   * - Permanent: (301 and 308)
   * - Temporary: (302, 303, and 307)
   * @param location - URL of desired redirection. Relative or external paths
   * (e.g., "/users/1", https://drash.land)
   *
   * @returns The final output to be sent.
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

  /**
   * Send the response to the client making the request.
   *
   * @returns A `Promise` of the output which is passed to `request.respond()`.
   * The output is only returned for unit testing purposes. It is not intended
   * to be used elsewhere as this call is the last call in the
   * request-resource-response lifecycle.
   */
  public async send(): Promise<Drash.Interfaces.ResponseOutput> {
    let body = this.generateResponse();
    let output: Drash.Interfaces.ResponseOutput = {
      status: this.status_code,
      headers: this.headers,
      body: encoder.encode(body),
    };

    this.request.respond(output);

    output.status_code = this.status_code;
    return output;
  }

  /**
   * Send the response of a static asset (e.g., a CSS file, JS file, PDF file,
   * etc.) to the client making the request.
   *
   * @param file - The file that will be served to the client.
   * @param contents - The content in a `Uint8Array`.
   *
   * @returns The final output to be sent.
   */
  public sendStatic(): Drash.Interfaces.ResponseOutput {
    let output: Drash.Interfaces.ResponseOutput = {
      status: this.status_code,
      headers: this.headers,
      body: this.body as Uint8Array,
    };

    this.request.respond(output);

    output.status_code = this.status_code;
    return output;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  protected getContentType(): string {
    if (this.options.default_content_type) {
      return this.options.default_content_type;
    }

    return this.getContentTypeFromRequestAcceptHeader();
  }

  /**
   * Get the content type from the request object's "Accept" header. Default to
   * the response_output config passed in when the server was created if no
   * accept header is specified. If no response_output config was passed in
   * during server creation, then default to application/json.
   *
   *
   * @returns A content type to set as this object's content-type header. If
   * multiple content types are passed in, then return the first accepted
   * content type.
   */
  protected getContentTypeFromRequestAcceptHeader(): string {
    const accept = this.request.headers.get("Accept") ||
      this.request.headers.get("accept");
    if (accept) {
      try {
        let contentTypes = accept.split(";")[0].trim();
        if (contentTypes && contentTypes === "*/*") {
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
        // Do nothing... defaults to returning  application/json below
      }
    }
    return "application/json";
  }
}
