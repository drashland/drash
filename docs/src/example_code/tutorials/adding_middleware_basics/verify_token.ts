// import Drash from "https://deno.land/x/drash/mod.ts";
import Drash from "../../../../../mod.ts";

class VerifyToken extends Drash.Http.Middleware {
  public run(request: any) {
    let token = request.getHeaderVar('super_secret_token');

    if (!token) {
      throw new Drash.Exceptions.HttpException(400, "Where is the token?");
    }

    let tokenMatch = (token == "AllYourBaseAreBelongToUs");

    if (!tokenMatch) {
      throw new Drash.Exceptions.HttpException(403, "Mmm... bad token.");
    }
  }
}

