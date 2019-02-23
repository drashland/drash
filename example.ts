import Drash from './Drash.ts';

// let server = new Drash.Server({
//   response_output: 'text/html'
// });
let server = new Drash.Server();

server.addHttpResource({
  paths: [
    '/hello',
    '/hello/',
    '/hello/:name',
    '/test',
  ],
  class: function HelloResource() {
    this.HTTP_GET_JSON = () => {
      this.response.body = {
        hello: this.request.path_params['name']
      }
      return this.response;
    };

    this.HTTP_GET_HTML = () => {
      this.response.body = this.request.path_params['name'];
      return this.response;
    };
  }
});


server.run();
