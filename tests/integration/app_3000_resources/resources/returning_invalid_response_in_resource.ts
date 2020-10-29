import { Drash } from "../../../../mod.ts";

export default class InvalidReturningOfResponseResource extends Drash.Http.Resource {
  static paths = ["/invalid/returning/of/response"]
  public GET() {

  }
  public POST() {
    return "hello"
  }
}
