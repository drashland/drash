import Drash from "../drash.ts";

export default class Response extends Drash.Response {
  public send(): void {
    let body;

    switch (this.headers.get('Content-Type')) {
      case 'application/json':
        body = JSON.stringify({body: this.body});
        break;
      case 'text/html':
        body = this.body;
        break;
      case 'application/xml':
      case 'text/xml':
        body = `<body>${this.body}</body>`;
        break;
      default:
        break;
      }

    this.request.respond({
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body),
    });
  }
}