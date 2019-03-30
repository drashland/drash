// namespace Drash.Http

import Drash from "../../mod.ts";

/**
 * @class Resource
 * This is the base resource class for all resources. All resource classes must
 * be derived from this class.
 */
export default class Resource {

  public paths;
  public name;

  /**
   * The request object.
   *
   * @property Drash.Http.Request request
   */
  protected request: Drash.Http.Request;

  /**
   * The response object.
   *
   * @property Drash.Http.Response response
   */
  protected response: Drash.Http.Response;

  /**
   * The server object.
   *
   * @property Drash.Http.Server server
   */
  protected server: Drash.Http.Server;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param Drash.Http.Request request
   *     The request object.
   * @param Drash.Http.Response response
   *     The response object.
   * @param Drash.Http.Server server
   *     The server object.
   */
  constructor(request: Drash.Http.Request, response: Drash.Http.Response, server: Drash.Http.Server) {
    this.request = request;
    this.response = response;
    this.server = server;
  }
}
