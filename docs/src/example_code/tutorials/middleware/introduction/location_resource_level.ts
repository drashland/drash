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
