import Drash from "../../mod.ts";

export default class Resource {
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
    this.response = new Drash.Http.Response(request);
  }
}
