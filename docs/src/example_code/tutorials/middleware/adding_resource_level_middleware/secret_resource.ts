// import Drash from "https://deno.land/x/drash/mod.ts";
import Drash from "../../../../../../mod.ts";

export default class SecretResource extends Drash.Http.Resource {

  static paths = ["/secret", "/secret/"];

  static middleware = {
    before_request: [
      "VerifyTokenMiddleware"
    ]
  };

  public GET() {
    this.response.body = "You have accessed the secret resource!";
    return this.response;
  }
}

