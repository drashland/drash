import Drash from "../bootstrap.ts";

export default class AppResource extends Drash.Http.Resource {
  static paths = ["*"];

  public GET() {
    return this.response;
  }

  public async hook_beforeRequest() {
    console.log("before");
    let test = await this.what();
    console.log(test);
  }

  public hook_afterRequest() {
    console.log("after");
  }

  public what() {
    return new Promise(resolve => {
      resolve("ok");
    });
  }
}
