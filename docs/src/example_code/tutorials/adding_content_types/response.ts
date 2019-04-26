import Drash from "https://deno.land/x/drash/mod.ts";

/**
 * Override `Drash.Http.Response` and export this class so it can be used to
 * replace `Drash.Http.Response` from `app.ts`.
 */
export default class Response extends Drash.Http.Response {
  public send(): any {
    let body;

    switch (this.headers.get("Content-Type")) {
      // Handle HTML
      case "text/html":
        body = `<!DOCTYPE html><head><link href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css" rel="stylesheet"></head><body class="m-10"><h1>Hello</h1><p>Status: ${
          this.status_code
        }</p><div class="content">${this.body}</div></body></html>`;
        break;

      // Handle JSON
      case "application/json":
        body = JSON.stringify({
          status_code: this.status_code,
          body: this.body
        });
        break;

      // Handle PDF
      case "application/pdf":
        this.headers.set("Content-Type", "text/html");
        body = `<html><body style="height: 100%; width: 100%; overflow: hidden; margin: 0px; background-color: rgb(82, 86, 89);"><embed width="100%" height="100%" name="plugin" id="plugin" src="https://crookse.github.io/public/files/example.pdf" type="application/pdf" internalinstanceid="19"></body></html>`;
        break;

      // Handle XML
      case "application/xml":
      case "text/xml":
        body = `<response><statuscode>${this.status_code}</statuscode><body>${
          this.body
        }</body></response>`;
        break;

      // Handle plain text and also default to this
      case "text/plain":
      default:
        body = `${this.status_code}; ${this.body}`;
        break;
    }

    let output = {
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body)
    };

    this.request.respond(output);
  }
}
