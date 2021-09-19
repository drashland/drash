import * as Drash from "../../mod.ts";

/**
 * This is the base resource class for all resources. All resource classes must
 * extend this base resource class.
 *
 * Drash defines a resource according to the MDN at the following page:
 *
 *     https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Identifying_resources_on_the_Web
 */
export class Resource implements Drash.Interfaces.IResource {
  public services?: Drash.Interfaces.IResourceServices;
  public path_parameters!: string;
  public static paths: string[] = [];
  public uri_paths: string[] = []
  public uri_paths_parsed: Drash.Interfaces.IResourcePathsParsed[] = [];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   *
   */
  // TODO(ebebbington): Only grip is, some props are public
  constructor(
    paths: string[]
  ) {
    this.uri_paths = paths
  }
}
