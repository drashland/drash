// namespace Drash.Http

export default class Resource {
  public paths;
  public name;
  protected request;
  protected response;
  protected server;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param ServerRequest request
   */
  constructor(request, response, server) {
    this.request = request;
    this.response = response;
    this.server = server;
  }
}
