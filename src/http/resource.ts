import { IResource, IResourceOptions, IResourcePathsParsed } from "../interfaces.ts";
import { Response } from "./response.ts";
import { Server } from "./server.ts";
import { Request } from "./request.ts";
import { Factory } from "../gurus/factory.ts";

/**
 * This is the base resource class for all resources. All resource classes
 * must be derived from this class.
 */
export class Resource implements IResource {
  /**
     * A property to hold the middleware this resource uses.
     */
  public middleware: { after_request?: []; before_request?: [] } = {};

  // TODO(crookse) Change this to uris.
  public paths: string[] = [];

  /**
   * A property to hold the expanded version of this object's URIs. An example
   * of the expanded version is as follows:
   *
   *     {
   *       og_path: "/:id",
   *       regex_path: "^([^/]+)/?$",
   *       params: ["id"],
   *     }
   */
  public paths_parsed: IResourcePathsParsed[] = [];

  /**
   * The path params, which are taken from this object's URIs (if they have any
   * path params).
   */
  public path_params: string[] = [];

  /**
   * The request object.
   */
  // @ts-ignore: See mod.ts TS IGNORE NOTES > NOTE 1.
  protected request: Request;

  /**
   * The server object.
   */
  // @ts-ignore: See mod.ts TS IGNORE NOTES > NOTE 1.
  protected server: Server;

  /**
   * The response object.
   */
  // @ts-ignore: See mod.ts TS IGNORE NOTES > NOTE 1.
  protected response: Response;

  /**
   * This object's options.
   */
  // @ts-ignore: See mod.ts TS IGNORE NOTES > NOTE 1.
  protected options: IResourceOptions = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public create(): void {
    this.server = this.options.server!;

    const contentType = this.server.options.default_response_content_type!;

    this.response = Factory.create(Response, {
      default_response_content_type: contentType
    });
  }

  public addOptions(options: IResourceOptions): void {
    this.options = options;
  }

  public clone(options: IResourceOptions): this {
    const clone = Object.create(this);
    clone.request = options.request!;
    clone.path_params = options.path_params!;
    clone.server = options.server!;
    return clone;
  }
}
