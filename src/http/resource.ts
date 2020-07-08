import { Drash } from "../../mod.ts";

/**
 * @memberof Drash.Http
 * @class Resource
 *
 * @description
 *     This is the base resource class for all resources. All resource classes
 *     must be derived from this class.
 */
export class Resource implements Drash.Interfaces.Resource {

  /**
   * @description
   *     A property to hold the name of this resource. This property is used by
   *     Drash.Http.Server to help it store resources in its resources property
   *     by name.
   *
   * @property string name
   */
  public name: string = "";

  /**
   * @description
   *     A property to hold the paths to access this resource.
   *
   *     All derived resource classes MUST define this property as static
   *     (e.g., static paths = ["path"];)
   *
   * @property string[] paths
   */
  public paths: string[] = [];

  public paths_parsed: Drash.Interfaces.ResourcePaths[] = [];

  /**
   * @description
   *     The request object.
   *
   * @property Drash.Http.Request request
   */
  protected request: Drash.Http.Request;

  /**
   * @description
   *     The response object.
   *
   * @property Drash.Http.Response response
   */
  protected response: Drash.Http.Response;

  /**
   * @description
   *     The server object.
   *
   * @property Drash.Http.Server server
   */
  protected server: Drash.Http.Server;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @description
   *     Construct an object of this class.
   *
   * @param ServerRequest request
   *     The request object.
   * @param Drash.Http.Response response
   *     The response object.
   * @param Drash.Http.Server server
   *     The server object.
   */
  constructor(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
    server: Drash.Http.Server,
  ) {
    this.request = request;
    this.response = response;
    this.server = server;
  }
}
