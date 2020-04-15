import Drash from "../mod.ts";

export default class RequestAcceptsResource extends Drash.Http.Resource {
  static paths = ["/request-accepts"];

  public GET() {
    const matchedType = this.request.accepts("application/json");
    if (!matchedType) {
      this.response.body = JSON.stringify({
        success: false,
        message: 'This resource only accepts JSON'
      })
    }
    if (matchedType === "application/json") {
      this.response.body = JSON.stringify({
        success: true,
        message: 'Responding with the accepted content type'
      })
    }
    return this.response;
  }
}
