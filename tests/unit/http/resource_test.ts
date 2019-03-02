import members from "../../members.ts";

class MyResource extends members.Drash.Http.Resource {
  public GET() {
    this.response.body = "got";
    return this.response;
  }
}

let server = new members.Drash.Http.Server({
  response_output: "text/html"
});

let request = members.mockRequest();
let response = new members.Drash.Http.Response(request);

// TODO(crookse) This needs to be fixed by passing in the constructor args. This is stupid. The test
// is saying it expected 0 arguments, but got 3... there is supposed to be 3 arguments.
let resource = new MyResource();
resource.request = request;
resource.response = response;
resource.server = request;

response = resource.GET();
let actual = response.generateResponse();

members.test(function Resource() {
  members.assert.equal(
    actual,
    `{"status_code":200,"status_message":"OK","request":{"url":"/","method":"GET"},"body":"got"}`
  );
});
