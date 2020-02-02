import Drash from "../../mod.ts";

/**
 * @memberof Drash.Http
 * @class Middleware
 *
 * @description
 *     This is the base middleware class for all middleware classes.
 */
export default abstract class Middleware {
  /**
   * @description
   *     A property to hold the location that this middleware should process.
   *
   * @property string location
   */
  public location: string;

  /**
   * @description
   *     A property to hold the name of this middleware class. This property is
   *     used by `Drash.Http.Server` to help it store middleware in the correct
   *     `middleware_*` property.
   *
   * @property string name
   */
  public name: string;

  /**
   * @description
   *     A property to hold the request object.
   *
   * @property any request
   */
  protected request: any;

  /**
   * @description
   *     A property to hold the resource object. This property will only contain
   *     the resource object if this middleware is a resource-level middleware.
   *
   * @property Drash.Http.Resource resource
   */
  protected resource: Drash.Http.Resource;

  /**
   * @description
   *     A property to hold the server object handling this middleware.
   *
   * @property Drash.Http.Server server
   */
  protected server: Drash.Http.Server;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  /**
   * @param any request
   *     The request object.
   * @param Drash.Http.Server server
   *     The server object handling this middleware.
   * @param Drash.Http.Resource resource
   *     (optional) If this is a resource-level middleware, then it will have
   *     access to the resource that uses it.
   */
  constructor(
    request: any,
    server: Drash.Http.Server,
    resource?: Drash.Http.Resource
  ) {
    this.request = request;
    this.server = server;
    this.resource = resource ? resource : null;
  }

  // FILE MARKER: METHODS - ABSTRACT ///////////////////////////////////////////

  /**
   * @description
   *     Run this middleware.
   */
  abstract run();
}
