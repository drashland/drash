import Drash from '../drash.ts';
import HomeResource from './resources/home.ts';

// let server = new Drash.Server({
//   response_output: 'text/html'
// });
let server = new Drash.Server({
  response_output: 'text/json',
  resources: [
    HomeResource
  ]
});

server.run();
