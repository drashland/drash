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
  public allowed_content_types = [
    'application/json',
    'text/html',
    'text/xml',
  ];

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  constructor(request) {
    this.request = request;
    this.headers = new Headers();
    this.headers.set('Content-Type', this.getHeaderContentType());
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////////////////////////

  public send() {
    let body;


    console.log(this.headers.get('content-type'));

    switch (this.headers.get('Content-Type')) {
      case 'text/html':
        body =
`<!DOCTYPE html>
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
        break;
      case 'text/xml':
        body =
`<response>
  <statuscode>${this.status_code}</statuscode>
  <statusmessage>${this.getStatusMessage()}</statusmessage>
  <body>${this.body}</body>
</response>`;
      break;
      case 'application/json':
      default:
        body = JSON.stringify({
          status_code: this.status_code,
          status_message: this.getStatusMessage(),
          body: this.body
        });
        break;
    }

    this.request.respond({
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body),
    });
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

  getStatusMessage() {
    return this.status_messages[this.status_code];
  }
}
