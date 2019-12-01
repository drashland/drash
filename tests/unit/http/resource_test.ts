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
let resource = new MyResource(request, response, server);

response = resource.GET();
let actual = response.generateResponse();

members.test("resource.GET().generateResponse()", () => {
  members.assert.equal(
    JSON.parse(actual),
    {
      status_code: 200,
      status_message: "OK",
      body: "got",
      request: {
        method: "GET",
        uri: "/",
        url_query_params: {},
        url: "/"
      }
    }
  );
});
