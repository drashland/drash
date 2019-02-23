import Drash from './drash.ts';
import BaseResource from './src/http/base_resource.ts';

class HomeResource extends BaseResource {
  static paths = [
    '/hello',
    '/hello/',
    '/hello/:name',
    '/test',
  ];

  public HTTP_GET_JSON() {
    this.response.body = {
      hello: this.request.path_params['name']
        ? this.request.path_params['name']
        : ''
    }
    return this.response;
  }
  public HTTP_GET_HTML() {
    this.response.body = this.request.path_params['name'];
    return this.response;
  };
}

// let server = new Drash.Server({
//   response_output: 'text/html'
// });
let server = new Drash.Server();

server.addHttpResource(HomeResource);

server.run();
