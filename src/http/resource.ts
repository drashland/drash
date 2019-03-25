// namespace Drash.Http

import DrashHttpRequest from "./request.ts";
import DrashHttpResponse from "./response.ts";
import DrashHttpServer from "./server.ts";

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
  protected request: DrashHttpRequest;

  /**
   * The response object.
   *
   * @property Drash.Http.Response response
   */
  protected response: DrashHttpResponse;

  /**
   * The server object.
   *
   * @property Drash.Http.Server server
   */
  protected server: DrashHttpServer;

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
  constructor(request: DrashHttpRequest, response: DrashHttpResponse, server: DrashHttpServer) {
    this.request = request;
    this.response = response;
    this.server = server;
  }
}
