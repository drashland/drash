import members from "../../members.ts";

class MyResource extends members.Drash.Http.Resource {
  public GET() {
    this.response.body = "got";
    return this.response;
  }
}

let resource = new MyResource(
  members.mockRequest,
  new members.Drash.Http.Response(members.mockRequest)
);
let response = resource.GET();

members.test(async function Resource() {
  members.assert.equal(response.body, "got");
});
