import Resource from '../../src/http/resource.ts';
import Response from '../../src/http/response.ts';

class HomeResource extends Resource {
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
  public GET(): Response {
    this.response.body = `Hello, ${this.request.path_params.name ? this.request.path_params.name : 'world'}!`;

    return this.response;
  }

  /**
   * Handle POSTS requests.
   */
  public POST(): Response {
    this.response.body = 'POST request received.';
    return this.response;
  }
}

export default HomeResource
