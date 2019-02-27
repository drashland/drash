import Drash from "../../mod.ts";

/** Response handles sending a response to the client making the request. */
export default class Response {
  public body = {};
  public body_generated = "";
  public headers: Headers;
  public request;
  public status_code = 200;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  constructor(request) {
    this.request = request;
    this.headers = new Headers();
    this.headers.set("Content-Type", this.getHeaderContentType());
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////////////////////////

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
   */
  public getStatusMessage(): string {
    return Drash.Dictionaries.HttpStatusCodes[this.status_code]
      .short_description;
  }

  /**
   * Send the response to the client making the request.
   *
   * @return any
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

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////////////////////////

  protected generateHtmlResponse(): string {
    return `<!DOCTYPE html>
<head>
  <style>
    html { font-family: Arial }
  </style>
</head>
<body>
  <h1>${this.status_code} (${this.getStatusMessage()})</h1>
  <p>${this.body}</p>
</body>
</html>`;
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

    // Check the request's headers to see if `response-content-type: {content-type}` has been specified
    contentType = this.request.headers.get("Response-Content-Type")
      ? this.request.headers.get("Response-Content-Type")
      : contentType;

    // Check the request's URL query params to see if ?response_content_type={content-type} has been specified
    contentType = this.request.url_query_params.response_content_type
      ? this.request.url_query_params.response_content_type
      : contentType;

    // TODO(crookse) Check request body

    return contentType;
  }
}
