import { Drash } from "../../mod.ts";

/**
 * @memberof Drash.Http
 * @class Resource
 *
 * @description
 *     This is the base resource class for all resources. All resource classes
 *     must be derived from this class.
 */
export class Resource {
  /**
   * @description
   *     A property to hold the middleware this resource uses.
   *
   *     All derived middleware classes MUST define this property as static
   *     (e.g., static middleware = ["MiddlewareClass"];)
   *
   * @property string[] middleware
   */
  public middleware: { after_request?: []; before_request?: [] } = {};

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
   * @property any[] paths
   */
  public paths: any[] = [];

  /**
   * @description
   *     The request object.
   *
   * @property ServerRequest request
   */
  protected request: any;

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
    request: any,
    response: Drash.Http.Response,
    server: Drash.Http.Server,
  ) {
    this.request = request;
    this.response = response;
    this.server = server;
  }
}
