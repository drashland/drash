import Drash from "../bootstrap.ts";
import * as ResponseService from "./response_service.ts";

export default class Resource extends Drash.Http.Resource {
  static paths = ["*"];

  public GET() {
    return this.response;
  }
}
