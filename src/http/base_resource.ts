import Response from './response.ts';

export default class BaseResource {
  protected http_method = 'HTTP_GET_JSON';
  protected request; // Gets set in `Server.run()`
  protected response;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  constructor(request) {
    this.request = request;
    this.response = new Response(request);
  }

  // FILE MARKER: PUBLIC ///////////////////////////////////////////////////////////////////////////

  public handleRequest() {
    return this[this.http_method]();
  }

  public setHttpMethod(method) {
    this.http_method = method;
  }
}
