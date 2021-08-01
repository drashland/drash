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
  public middleware: { after_request?: []; before_request?: [] } = {};
  public path_parameters!: string;
  public uri_paths: string[] = [];
  public uri_paths_parsed: Drash.Interfaces.IResourcePathsParsed[] = [];
  public response!: Drash.Response;
  public request!: Drash.Request;
  public server!: Drash.Server;
  #options: Drash.Interfaces.IResourceOptions = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * See Drash.Interfaces.ICreateable.create().
   */
  public create(options: Drash.Interfaces.IResourceOptions): void {
    this.#setOptions(options);
    this.#setProperties();

    const contentType = this.server.options.default_response_content_type!;

    this.response = Drash.Factory.create(Drash.Response, {
      default_response_content_type: contentType,
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  #setOptions(options: Drash.Interfaces.IResourceOptions): void {
    if (!options.server) {
      throw new Drash.Errors.DrashError("D1007");
    }

    this.#options = options;
  }

  #setProperties(): void {
    this.server = this.#options.server!;
  }
}
