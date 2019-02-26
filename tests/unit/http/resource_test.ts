import members from "../../members.ts";

class MyResource extends members.Drash.Http.Resource {
  public GET() {
    this.response.body = "got";
    return this.response;
  }
}

let request = members.mockRequest();

let resource = new MyResource(
  request,
  new members.Drash.Http.Response(request)
);
let response = resource.GET();

members.test(async function Resource() {
  members.assert.equal(response.body, "got");
});
