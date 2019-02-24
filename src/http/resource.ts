import Response from './response.ts';
import Server from './server.ts';

export default class BaseResource {
  protected http_method = 'HTTP_GET_JSON';
  protected request;
  protected response;
  protected method_mappings = {
    'application/json': 'JSON',
    'application/xml':  'XML',
    'text/html':        'HTML',
    'text/xml':         'XML',
  };

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  constructor(request) {
    if (Server.resource_method_mappings) {
      this.method_mappings = Server.resource_method_mappings;
    }
    this.request = request;
    this.response = new Response(request);
    this.http_method = this.getHttpMethod();
  }

  // FILE MARKER: PUBLIC ///////////////////////////////////////////////////////////////////////////

  public getHttpMethod() {
    let output = this.request.headers.get('response-output-default');
    let resourceMethod = '';

    // Check the request headers to see if `response-output: {output}` has been specified
    if (
      this.request.headers.get('response-output')
      && (typeof this.request.headers.get('response-output') === 'string')
    ) {
      output = this.request.headers.get('response-output');
    }

    // Check the request's URL query params to see if ?output={output} has been specified
    // TODO(crookse) Add this logic
    // output = request.url_query_params.output
    //   ? request.url_query_params.output
    //   : output;

    if (this.method_mappings[output]) {
      resourceMethod = this.method_mappings[output];
    }

    return `${this.request.method.toUpperCase()}_${resourceMethod.toUpperCase()}`;
  }

  public handleRequest() {
    return this[this.http_method]();
  }
}
