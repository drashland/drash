import { ICreateable, IResourceOptions, IResourcePaths } from "../interfaces.ts";
import { Response } from "./response.ts";
import { Server } from "./server.ts";
import { Request } from "./request.ts";
import { Factory } from "../gurus/factory.ts";

/**
 * This is the base resource class for all resources. All resource classes
 * must be derived from this class.
 */
export class Resource implements ICreateable {
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
  protected request: Request|null = null;

  /**
   * The server object.
   */
  protected server: Server|null = null;

  /**
   * The response object.
   *
   * This initial value is changed in the `.create()` method. We only initialize
   * this property so that the compiler does not complain about it not being
   * initialized.
   */
  protected response: Response = new Response();

  /**
     * The server object.
     */
  protected options: IResourceOptions = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public create(): void {
    this.server = this.options.server!;
    this.request = this.options.request!;

    const contentType = this.server.options.default_response_content_type!;

    this.response = Factory.create(Response, {
      default_response_content_type: contentType
    });
  }

  public addOptions(options: IResourceOptions): void {
    this.options = options;
  }

  public clone(): this {
    return Object.create(this);
  }
}
