import Drash from '../drash.ts';
import HomeResource from './resources/home_resource.ts';

// let server = new Drash.Server({
//   response_output: 'text/html'
// });
let server = new Drash.Server({
  response_output: 'application/json',
  resources: [
    HomeResource
  ]
});

server.run();
