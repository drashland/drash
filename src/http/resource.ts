import * as Drash from "../../mod.ts";

/**
 * This is the base resource class for all resources. All resource classes must
 * extend this base resource class.
 *
 * Drash defines a resource according to the MDN at the following page:
 *
 *     https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web
 */
export class DrashResource {
  public middleware: { after_request?: []; before_request?: [] } = {};
  public path_parameters!: string;
  public request!: Drash.Request;
  public response!: Drash.Response;
  public server!: Drash.Server;
  public uri_paths: string[] = [];
  public uri_paths_parsed: Drash.Interfaces.IResourcePathsParsed[] = [];
  #options: Drash.Interfaces.IResourceOptions = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - FACTORY ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(options: Drash.Interfaces.IResourceOptions) {
    this.#options = options
    this.server = options.server!
    const contentType = this.server.options.default_response_content_type!;
    this.response = new DrashResponse({
      default_response_content_type: contentType,
    });
  }
}
