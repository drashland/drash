class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];
  static middleware = {
    before_request: [
      "MyFirstMiddleware"
    ],
    after_request: [
      "MySecondMiddleware"
    ]
  };
  public GET() {
    this.response.body = "Hello";
    return this.response;
  }
}

let server = new Drash.Http.Server({
  address: "localhost:1447",
  middleware: {
    resource_level: [
      MyFirstMiddleware,
      MySecondMiddleware,
      MyThirdMiddleware
    ]
  },
  resources: [
    HomeResource
  ],
  response_output: "application/json",
});
