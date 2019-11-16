import Drash from "../../mod.ts";

/**
 * @memberof Drash.Http
 * @class Middleware
 *
 * @description
 *     This is the base middleware class for all middleware classes.
 */
export default abstract class Middleware {

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
