import Drash from "../mod.ts";
import { Encoder } from "../system.ts";

export default class Response extends Drash.Http.Response {
  public send(): any {
    let body;

    switch (this.headers.get("Content-Type")) {
      // Handle HTML
      case "text/html":
        body = this.body;
        break;

      // Handle JSON
      case "application/json":
        body = JSON.stringify({ body: this.body });
        break;

      // Handle PDF
      case "application/pdf":
        this.headers.set("Content-Type", "text/html");
        body = `<html><body style="height: 100%; width: 100%; overflow: hidden; margin: 0px; background-color: rgb(82, 86, 89);"><embed width="100%" height="100%" name="plugin" id="plugin" src="https://www.adobe.com/content/dam/acom/en/security/pdfs/AdobeIdentityServices.pdf" type="application/pdf" internalinstanceid="19"></body></html>`;
        break;

      // Handle XML
      case "application/xml":
      case "text/xml":
        body = `<body>${this.body}</body>`;
        break;

      // Handle plain text
      case "text/plain":
        body = this.body;
        break;

      // Default to this
      default:
        body = this.body;
        break;
    }

    this.request.respond({
      status: this.status_code,
      headers: this.headers,
      body: new Encoder().encode(body)
    });
  }
}
