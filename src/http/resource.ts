/// Member: Drash.Http.Resource

import type { Drash } from "../../mod.ts";

/**
 * This is the base resource class for all resources. All resource classes
 * must be derived from this class.
 */
export class Resource implements Drash.Interfaces.Resource {
  /**
   * A property to hold the middleware this resource uses.
   */
  public middleware: { after_request?: []; before_request?: [] } = {};

  /**
   * A property to hold the name of this resource. This property is used by
   * Drash.Http.Server to help it store resources in its resources property
   * by name.
   */
  public name: string = "";

  /**
   * A property to hold the paths to access this resource.
   *
   * All derived resource classes MUST define this property as static. For
   * example, static paths = ["/path"].
   */
  public paths: string[] = [];

  /**
   * A property to hold the expanded versions of the paths. See
   * Drash.Interfaces.ResourcePaths for more information.
   */
  public paths_parsed: Drash.Interfaces.ResourcePaths[] = [];

  /**
   * The request object that targeted this resource.
   */
  protected request: Drash.Http.Request;

  /**
   * The response object that this resource will use to respond to the request.
   */
  protected response: Drash.Http.Response;

  /**
   * The server object.
   */
  protected server: Drash.Http.Server;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param request - See this.request.
   * @param response - See this.response.
   * @param server - See this.server.
   * @param paths - See this.paths.
   * @param middleware - See this.middleware.
   */
  constructor(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
    server: Drash.Http.Server,
    paths: string[],
    middleware: { after_request?: []; before_request?: [] },
  ) {
    this.request = request;
    this.response = response;
    this.server = server;
    this.paths = paths;
    this.middleware = middleware;
  }
}
