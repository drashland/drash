import { IResource, IResourcePaths } from "../interfaces.ts";
import { Response } from "./response.ts";
import { Server } from "./server.ts";
import { Request } from "./request.ts";

/**
 * This is the base resource class for all resources. All resource classes
 * must be derived from this class.
 */
export class Resource implements IResource {
  /**
     * A property to hold the middleware this resource uses.
     */
  public middleware: { after_request?: []; before_request?: [] } = {};

  /**
     * A property to hold the name of this resource. This property is used by
     * Server to help it store resources in its resources property
     * by name.
     */
  public name: string = "";

  /**
     * A property to hold the paths to access this resource.
     *
     * All derived resource classes MUST define this property as static
     * (e.g., static paths = ["path"];)
     */
  public paths: string[] = [];

  /**
     * A property to hold the expanded versions of the paths. An expanded version of a path looks like the following:
     * ```ts
     * {
     *   og_path: "/:id",
     *   regex_path: "^([^/]+)/?$",
     *   params: ["id"],
     * ```
     */
  public paths_parsed: IResourcePaths[] = [];

  /**
     * The request object.
     */
  protected request: Request;

  /**
     * The response object.
     */
  protected response: Response;

  /**
     * The server object.
     */
  protected server: Server;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param request - The request object.
   * @param response - The response object.
   * @param server - The server object.
   * @param paths - The paths the resource accepts
   * @param middleware - Any middleware for the resource
   */
  constructor(
    request: Request,
    response: Response,
    server: Server,
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
