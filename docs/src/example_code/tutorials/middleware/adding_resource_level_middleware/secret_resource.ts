import Drash from "https://deno.land/x/drash/mod.ts";

export default class SecretResource extends Drash.Http.Resource {

  static paths = ["/secret", "/secret/"];

  static middleware = {
    before_request: [
      "VerifyTokenMiddleware"
    ]
  };

  public GET() {
    this.response.body = {
      method: "GET",
      body: "You have accessed the secret resource!"
    };
    return this.response;
  }
}

