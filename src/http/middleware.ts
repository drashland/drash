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
   *     A property to hold the name of this middleware class. This property is
   *     used by Drash.Http.Server to help it store middleware in the correct
   *     middleware_* property.
   *
   * @property string name
   */
  public name: string = "";

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
   * @property Drash.Http.Resource|null resource
   */
  protected resource: Drash.Http.Resource | null;

  /**
   * @description
   *     A property to hold the response object. This property will only contain
   *     the response object if the server was able to get a response from the
   *     resource.
   *
   * @property Drash.Http.Resource|null resource
   */
  protected response: Drash.Http.Response | null;

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
   * @param Drash.Http.Resource|null resource
   *     (optional) If this is a resource-level middleware, then it will have
   *     access to the resource that uses it.
   * @param Drash.Http.Response|null response
   *     (optional) The response object from the resource. This is only set if
   *     this middleware is a resource-level middleware and the resource
   *     successfully returned a response. That response will be passed as the
   *     argument here.
   */
  constructor(
    request: any,
    server: Drash.Http.Server,
    resource?: Drash.Http.Resource | null,
    response?: Drash.Http.Response | null,
  ) {
    this.request = request;
    this.server = server;
    this.resource = resource ? resource : null;
    this.response = response ? response : null;
  }

  // FILE MARKER: METHODS - ABSTRACT ///////////////////////////////////////////

  /**
   * @description
   *     Run this middleware.
   */
  abstract run(): any | void;
}
