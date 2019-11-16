import Drash from "../../mod.ts";

/**
 * @memberof Drash.Http
 * @class Middleware
 *
 * @description
 *     This is the base middleware class for all middleware classes.
 */
export default abstract class Middleware {

  /**
   * @description
   *     A property to hold the name of this middleware class. This property is
   *     used by `Drash.Http.Server` to help it store middleware in the correct
   *     `middleware_*` property.
   *
   * @property string name
   */
  public name: string;

  // FILE MARKER: METHODS - ABSTRACT ///////////////////////////////////////////

  /**
   * @description
   *     Write a log message.
   *
   * @param any request
   *     The request object.
   */
  abstract run(request: any);
}
