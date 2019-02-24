import Resource from '../../src/http/resource.ts';

class HomeResource extends Resource {
  static paths = [
    '/',
    '/hello',
    '/hello/',
    '/hello/:name',
    '/hello/:name/',
  ];

  /**
   * Handle GET requests that request a JSON response.
   * 
   * @return Response
   */
  public GET_JSON() {
    this.response.body = {
      hello: this.request.path_params.name
        ? `Hello ${this.request.path_params.name}!`
        : 'No name provided.'
    }
    return this.response;
  }

  /**
   * Handle GET requests that request an HTML response.
   * 
   * @return Response
   */
  public GET_HTML() {
    this.response.body = this.request.path_params.name
      ? `Hello ${this.request.path_params.name}!`
      : 'No name provided.';
      return this.response;
  };

  /**
   * Handle POSTS requests that request an HTML response.
   */
  public POST_HTML() {
    this.response.body = 'POST request received.';
    return this.response;
  }
}

export default HomeResource
