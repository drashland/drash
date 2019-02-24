import Server from './src/http/server.ts';
import Response from './src/http/response.ts';
import Resource from './src/http/resource.ts';

export default {
  Http: {
    Response: Response,
    Resource: Resource,
    Server: Server,
  }
}
