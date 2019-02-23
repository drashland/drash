import BaseResource from '../../src/http/base_resource.ts';

class HomeResource extends BaseResource {
  static paths = [
    '/',
    '/hello',
    '/hello/',
    '/hello/:name',
    '/test',
  ];

  public HTTP_GET_JSON() {
    this.response.body = {
      hello: this.request.path_params['name']
        ? `Hello ${this.request.path_params['name']}!`
        : 'No name provided.'
    }
    return this.response;
  }
  public HTTP_GET_HTML() {
  this.response.body = this.request.path_params['name']
    ? `Hello ${this.request.path_params['name']}!`
    : 'No name provided.';
    return this.response;
  };
}

export default HomeResource
