import Drash from "../../drash.ts";

class HomeResource extends Drash.Resource {
  static paths = [
    '/',
    '/hello',
    '/hello/',
    '/hello/:name',
    '/hello/:name/',
  ];

  /**
   * Handle GET requests.
   * 
   * @return Response
   */
  public GET() {
    this.response.body = `Hello, ${this.request.path_params.name ? this.request.path_params.name : 'world'}!`;

    return this.response;
  }

  /**
   * Handle POSTS requests.
   */
  public POST() {
    this.response.body = 'POST request received.';
    return this.response;
  }
}

export default HomeResource
