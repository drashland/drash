import Drash from "https://deno.land/x/drash/mod.ts";

/**
 * Export the `Response` class that `Drash.Http.Server` will use.
 *
 * This class will be used to replace `Drash.Http.Response` before `Drash.Http.Server` is created.
 */
export default class Response extends Drash.Http.Response {
  /**
   * Send a response to the client.
   * @return any
   */
  public send(): any {
    let body;

    switch (this.headers.get("Content-Type")) {
      // Handle HTML
      case "text/html":
        body = `<!DOCTYPE html>
<head>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>${this.body}</body>
</html>`;
        break;

      // Handle JSON
      case "application/json":
      default:
        body = JSON.stringify({
          status_code: this.status_code,
          status_message: this.getStatusMessage(),
          request: {
            url: this.request.url,
            method: this.request.method.toUpperCase()
          },
          body: this.body
        });
        break;
    }

    this.request.respond({
      status: this.status_code,
      headers: this.headers,
      body: new TextEncoder().encode(body)
    });
  }
}
