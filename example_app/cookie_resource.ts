import Drash from "../mod.ts";

export default class HomeResource extends Drash.Http.Resource {
  static paths = ["/cookie", "/cookie/"];

  public GET() {
    this.response.body = "GET request received!";
    this.response.setCookie({name: 'testCookie', value: 'Drash'})
    return this.response;
  }

  public POST () {
    const cookie = this.request.getBodyParam('name')
    this.response.body = "Saved your cookie!";
    return this.response;
  }

  public PUT() {
    this.response.body = "PUT request received!";
    return this.response;
  }

  public DELETE() {
    this.response.body = "DELETE request received!";
    this.response.delCookie('testCookie')
    return this.response;
  }
}