import { Drash } from "../mod.ts";

export default class RequestAcceptsTwoResource extends Drash.Http.Resource {
  static paths = ["/request-accepts-two"];

  public GET() {
    let contentTypes: string[] = this.request.headers.get("Accept").split(";");
    for (let content of contentTypes) {
      content = content.trim();
      if (content.indexOf("application/json") != -1) {
        return this.jsonResponse();
      }
      if (content.indexOf("text/html") != -1) {
        return this.htmlResponse();
      }
      if (content.indexOf("text/xml") != -1) {
        return this.xmlResponse();
      }
    }
  }

  protected htmlResponse(): Drash.Http.Response {
    this.response.headers.set("Content-Type", "text/html");
    this.response.body = "<div>response: text/html</div>";
    return this.response;
  }

  protected jsonResponse(): Drash.Http.Response {
    this.response.headers.set("Content-Type", "application/json");
    this.response.body = { response: "application/json" };
    return this.response;
  }

  protected xmlResponse(): Drash.Http.Response {
    this.response.headers.set("Content-Type", "text/xml");
    this.response.body = "<response>text/xml</response>";
    return this.response;
  }
}
