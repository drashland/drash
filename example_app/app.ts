import Drash from "../mod.ts";

class HomeResource extends Drash.Http.Resource {

  static paths = ["/"];

  public GET() {
    this.response.body = "GET request received!";
    return this.response;
  }

  public async POST() {
    this.response.body = await this.request.getBodyFile("file", 1024 * 1024);
    return this.response;
  }
}

class FilesResource extends Drash.Http.Resource {

  static paths = ["/files/:name"];

  public GET() {
    return this.response;
  }

  public POST() {
    this.response.body = this.request.getBodyParam("v-bp");
    this.response.body = this.request.getHeaderParam("v-header");
    this.response.body = this.request.getQueryParam("v_qp");
    console.log(this.response.body);
    return this.response;
  }

  public DELETE() {
    return this.response;
  }
}

let server = new Drash.Http.Server({
  address: "localhost:1447",
  response_output: "application/json",
  resources: [
    HomeResource,
    FilesResource
  ],
});

server.run();

