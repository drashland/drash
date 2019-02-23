export default class Response {
  public body = {};
  public headers;
  protected request;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  constructor(request) {
    this.request = request;
    this.headers = new Headers();
  }

  // FILE MARKER: METHODS - PUBLIC /////////////////////////////////////////////////////////////////

  public send() {
    switch (this.headers['Content-Type']) {
      case 'text/html':
        let body = `<!DOCTYPE html>
<head>
  <style>
    html { font-family: Arial }
  </style>
</head>
<body>
  <p>${this.body}</p>
</body>
</html>`;
        this.request.respond({
          headers: this.headers,
          body: new TextEncoder().encode(body),
        });
        break;
      case 'application/json':
      default:
        this.request.respond({
          headers: this.headers,
          body: new TextEncoder().encode(JSON.stringify(this.body)),
        });
        break;
    }
  }
}
