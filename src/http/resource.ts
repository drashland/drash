export default class Resource {
  protected request;
  protected response;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param ServerRequest request
   */
  constructor(request, response) {
    this.request = request;
    this.response = response;
  }
}
