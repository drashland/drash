// import Drash from "https://deno.land/x/drash/mod.ts";
import Drash from "../../../../../mod.ts";

export default class VerifyTokenMiddleware extends Drash.Http.Middleware {
  public run(request: any) {
    let token = request.getQueryVar('super_secret_token');

    if (!token) {
      throw new Drash.Exceptions.HttpMiddlewareException(400, "Where is the token?");
    }

    if (token != "AllYourBaseAreBelongToUs") {
      throw new Drash.Exceptions.HttpMiddlewareException(403, "Mmm... bad token.");
    }
  }
}
