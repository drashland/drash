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
  public services: Drash.Interfaces.IResourceServices = {};
  public paths: string[] = [];

  /**
   * Redirect the incoming request to another resource
   *
   * @example
   * ```js
   * this.redirect("http://localhost/login", response);
   * return;
   * ```
   *
   * @param location - The location or resource uri of where you want to redirect the request to
   * @param response - The response object, to set the related headers and status code on
   */
  public redirect(location: string, response: Drash.Response): void {
    response.headers.set("Location", location);
    response.status = 302;
  }
}
