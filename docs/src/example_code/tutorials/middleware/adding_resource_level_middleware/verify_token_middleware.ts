import Drash from "https://deno.land/x/drash/mod.ts";

export default class VerifyTokenMiddleware extends Drash.Http.Middleware {
  public run() {
    let token = this.request.getQueryParam('super_secret_token');

    if (!token) {
      throw new Drash.Exceptions.HttpMiddlewareException(400, "Where is the token?");
    }

    if (token != "AllYourBaseAreBelongToUs") {
      throw new Drash.Exceptions.HttpMiddlewareException(403, `Mmm... "${token}" is a bad token.`);
    }
  }
}
