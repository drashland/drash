import Drash from "../../mod.ts";

/** Response handles sending a response to the client making the request. */
export default class Response {
  public body = {};
  public headers: Headers;
  public request;
  public status_code = 200;
  public status_messages = {
    200: "OK",
    400: "Bad Request",
    404: "Not Found",
    405: "Method Not Allowed",
    500: "Internal Server Error"
  };
  public body_generated = "";

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
        this.headers.set(
          "Content-Type",
          Drash.Http.Server.CONFIGS.default_response_content_type
        );
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
      .response_message;
  }

  /**
   * Send the response to the client making the request.
   *
   * @return string
   */
  public send(): string {
    let body = this.generateResponse();

    Drash.Http.Server.log.debug(
      `Sending response. Content-Type: ${this.headers.get(
        "Content-Type"
      )}. Status: ${this.getStatusMessage()}.`
    );

    this.request.respond({
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body)
    });

    return this.body_generated;
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
    let contentType = Drash.Http.Server.CONFIGS.default_response_content_type;

    // Check the request's headers to see if `response-content-type: {content-type}` has been specified
    contentType = this.request.headers.get("response-content-type")
      ? this.request.headers.get("response-content-type")
      : contentType;

    // Check the request's URL query params to see if ?response_content_type={content-type} has been specified
    // TODO(crookse) Add this logic
    // contentType = request.query_params.response_content_type
    //   ? request.url_query_params.response_content_type
    //   : contentType;

    // TODO(crookse) Check request body

    return contentType;
  }
}
