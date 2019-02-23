import Server from '../server.ts';

export default class Response {
  public allowed_content_types = [
    'application/json',
    'text/html',
    'text/xml',
  ];
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
    if (Server.allowed_content_types.length) {
      this.allowed_content_types = Server.allowed_content_types;
    }

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
      case 'text/html':
        body = this.generateTextHtmlResponse();
        break;
      case 'text/xml':
        body = this.generateTextXmlResponse();
        break;
      case 'application/json':
      default:
        body = this.generateApplicationJsonResponse();
        break;
    }

    this.request.respond({
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body),
    });
  }

  // FILE MARKER: METHODS - PROTECTED //////////////////////////////////////////////////////////////

  protected generateApplicationJsonResponse() {
    return JSON.stringify({
      status_code: this.status_code,
      status_message: this.getStatusMessage(),
      body: this.body
    });
  }

  protected generateTextHtmlResponse() {
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

  protected generateTextXmlResponse() {
  return `<response>
  <statuscode>${this.status_code}</statuscode>
  <statusmessage>${this.getStatusMessage()}</statusmessage>
  <body>${this.body}</body>
</response>`;
  }

  protected getHeaderContentType() {
    let output = this.request.headers.get('response-output-default');

    // Check the request headers to see if `response-output: {output}` has been specified
    if (
      this.request.headers['response-output']
      && (typeof this.request.headers['response-output'] === 'string')
    ) {
      output = this.request.headers['response-output'];
    }

    // Check the request's URL query params to see if ?output={output} has been specified
    // TODO(crookse) Add this logic
    // output = request.url_query_params.output
    //   ? request.url_query_params.output
    //   : output;

    if (this.allowed_content_types.indexOf(output) != -1) {
      return output;
    }

    return 'application/json';
  }
}
