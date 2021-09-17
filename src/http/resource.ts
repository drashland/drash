import * as Drash from "../../mod.ts";

/**
 * This is the base resource class for all resources. All resource classes must
 * extend this base resource class.
 *
 * Drash defines a resource according to the MDN at the following page:
 *
 *     https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web
 */
export class DrashResource implements Drash.Interfaces.IResource {
  public middleware: { after_request?: []; before_request?: [] } = {};
  public path_parameters!: string;
  public request!: Drash.DrashRequest;
  public response: Drash.DrashResponse;
  public static paths: string[] = [];
  public uri_paths: string[] = []
  public uri_paths_parsed: Drash.Interfaces.IResourcePathsParsed[] = [];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   *
   */
  constructor(
    defaultResponseContentType: string,
    paths: string[]
  ) {
    this.uri_paths = paths
    this.response = new Drash.DrashResponse(defaultResponseContentType);
  }
}
