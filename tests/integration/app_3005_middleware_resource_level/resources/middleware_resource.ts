import { Drash } from "../../../../mod.ts";
import HeaderTokenMiddleware from "../middleware/header_token_middleware.ts";
import ChangeResponseMiddleware from "../middleware/change_response_middleware.ts";

@Drash.Http.Middleware({
  before_request: [HeaderTokenMiddleware],
  after_request: [],
})
export default class MiddlewareResource extends Drash.Http.Resource {
  static paths = ["/middleware"];

  @Drash.Http.Middleware({
    after_request: [ChangeResponseMiddleware],
  })
  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }
}
