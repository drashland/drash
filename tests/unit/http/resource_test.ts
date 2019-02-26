import members from "../../members.ts";

class MyResource extends members.Drash.Http.Resource {
  public GET() {
    this.response.body = "got";
    return this.response;
  }
}

let request = members.mockRequest();
let response = new members.Drash.Http.Response(request);

let resource = new MyResource(request, response);
response = resource.GET();
let actual = response.generateResponse();

members.test(async function Resource() {
  members.assert.equal(
    actual,
    `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"got"}`
  );
});
