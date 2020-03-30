import Drash from "../mod.ts";

export default class Middleware extends Drash.Http.Middleware {
  public run() {
    if (!this.request.getHeaderParam("token")) {
      throw new Drash.Exceptions.HttpException(
        400,
        "No token, dude.",
      );
    }
  }
}
