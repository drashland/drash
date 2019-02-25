export default class Resource {
  static Drash;
  protected request;
  protected response;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param ServerRequest request
   */
  constructor(request) {
    this.request = request;
    console.log(Drash.Http.Response);
    this.response = new Drash.Http.Response(request);
  }
}
