import Response from './response.ts';

export default class BaseResource {
  protected http_method = 'HTTP_GET_JSON';
  protected request;
  protected response;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  constructor(request) {
    this.request = request;
    this.response = new Response(request);
    this.http_method = this.getHttpMethod();
  }

  // FILE MARKER: PUBLIC ///////////////////////////////////////////////////////////////////////////

  public getHttpMethod() {
    let output = this.request.headers.get('response-output-default');

    // Check the request headers to see if `response-output: {output}` has been specified
    if (
      this.request.headers['response-output']
      && (typeof this.request.headers['response-output'] === 'string')
    ) {
      output = this.request.headers['response-output'];
    }

    // Check the request's URL query params to see if ?output={output} has been specified
    // TODO(crookse) Add this logic
    // output = request.url_query_params.output
    //   ? request.url_query_params.output
    //   : output;

    switch (output) {
      case 'application/json':
        return 'HTTP_GET_JSON';
      case 'text/html':
        return 'HTTP_GET_HTML';
      case 'text/xml':
        return 'HTTP_GET_XML';
      default:
        break;
    }

    return 'HTTP_GET_JSON';
  }

  public handleRequest() {
    return this[this.http_method]();
  }
}
