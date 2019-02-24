import Drash from "../../mod.ts";

export default class HomeResource extends Drash.Http.Resource {
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
