import Server from './server.ts';

export default class Response {
  public body = {};
  public headers: Headers;
  public request;
  public status_code = 200;
  public status_messages = {
    200: 'OK',
    400: 'Bad Request',
    404: 'Not Found',
    405: 'Method Not Allowed',
    500: 'Internal Server Error',
  }

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  constructor(request) {

    this.request = request;
    this.headers = new Headers();
    this.headers.set('Content-Type', this.getHeaderContentType());
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////////////////////////

  public getStatusMessage() {
    return this.status_messages[this.status_code];
  }

  public send() {
    let body;

    switch (this.headers.get('Content-Type')) {
      case 'application/json':
        body = this.generateJsonResponse();
        break;
      case 'text/html':
        body = this.generateHtmlResponse();
        break;
      case 'application/xml':
      case 'text/xml':
        body = this.generateXmlResponse();
        break;
      default:
        this.headers.set('Content-Type', this.request.headers.get('response-output-default'));
        return this.send();
    }

    this.request.respond({
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body),
    });
  }

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////////////////////////

  protected generateHtmlResponse() {
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

  protected generateJsonResponse() {
    return JSON.stringify({
      status_code: this.status_code,
      status_message: this.getStatusMessage(),
      body: this.body
    });
  }

  protected generateXmlResponse() {
  return `<response>
  <statuscode>${this.status_code}</statuscode>
  <statusmessage>${this.getStatusMessage()}</statusmessage>
  <body>${this.body}</body>
</response>`;
  }

  protected getHeaderContentType() {
    let contentType = this.request.headers.get('response-output-default');

    // Check the request headers to see if `response-output: {output}` has been specified
    if (
      this.request.headers.get('response-output')
      && (typeof this.request.headers.get('response-output') === 'string')
    ) {
      contentType = this.request.headers.get('response-output');
    }

    // Check the request's URL query params to see if ?output={output} has been specified
    // TODO(crookse) Add this logic
    // output = request.url_query_params.output
    //   ? request.url_query_params.output
    //   : output;

    return contentType;
  }
}
