import * as Drash from "../../mod.ts";

/**
 * This is the base resource class for all resources. All resource classes
 * must be derived from this class.
 *
 * Drash defines a resource according to the MDN at the following page:
 *
 *     https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web
 */
export class Resource implements Drash.Interfaces.IResource {
  /**
     * A property to hold the middleware this resource uses.
     */
  public middleware: { after_request?: []; before_request?: [] } = {};

  /**
   * The path params (if any), which are taken from this resource's URIs.
   */
  public path_params!: string;

  /**
   * The URI paths that this resource is located at.
   */
  public uri_paths: string[] = [];

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
  public uri_paths_parsed: Drash.Interfaces.IResourcePathsParsed[] = [];

  /**
   * The request object.
   */
  // @ts-ignore: See mod.ts TS IGNORE NOTES > NOTE 1.
  protected request: Drash.Request;

  /**
   * The server object.
   */
  // @ts-ignore: See mod.ts TS IGNORE NOTES > NOTE 1.
  protected server: Drash.Server;

  /**
   * The response object.
   */
  // @ts-ignore: See mod.ts TS IGNORE NOTES > NOTE 1.
  public response: Drash.Response;

  /**
   * This object's options.
   */
  // @ts-ignore: See mod.ts TS IGNORE NOTES > NOTE 1.
  protected options: Drash.Interfaces.IResourceOptions = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * See ICreateable#create.
   */
  public create(options: Drash.Interfaces.IResourceOptions): void {
    this.options = options;

    this.server = this.options.server!;

    const contentType = this.server.options.default_response_content_type!;

    this.response = Drash.Factory.create(Drash.Response, {
      default_response_content_type: contentType,
    });
  }
}
