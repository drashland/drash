import { Drash } from "../mod.ts";

export default class RequestAcceptsResource extends Drash.Http.Resource {
  static paths = ["/request-accepts"];

  public GET() {
    const typeToRequest = this.request.getUrlQueryParam("typeToCheck");

    let matchedType;
    if (typeToRequest) {
      matchedType = this.request.accepts(typeToRequest);
    } else {
      matchedType = this.request.accepts(["text/html", "application/json"]);
    }

    if (!matchedType) {
      this.response.body = JSON.stringify({ success: false });
    } else {
      this.response.body = JSON.stringify(
        { success: true, message: matchedType },
      );
    }

    return this.response;
  }
}
