import { Drash } from "../deps.ts";
const decoder = new TextDecoder();

export default class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];

  public async GET() {
    const realPath = await Deno.realPath(".");
    this.response.body = decoder.decode(
      await Deno.readFile(realPath + "/public/views/index.html"),
    );
    return this.response;
  }

  public POST() {
    this.response.body = "POST method not implemented.";
    return this.response;
  }

  public DELETE() {
    this.response.body = "DELETE method not implemented.";
    return this.response;
  }

  public PUT() {
    this.response.body = "PUT method not implemented.";
    return this.response;
  }
}
