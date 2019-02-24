import Server from './src/http/server.ts';
import Response from './src/http/response.ts';
import Resource from './src/http/resource.ts';
import HttpStatusCodes from './src/dictionaries/http_status_codes.ts';

export default {
  Dictionaries: {
    HttpStatusCodes: HttpStatusCodes,
  },
  Http: {
    Response: Response,
    Resource: Resource,
    Server: Server,
  },
}
