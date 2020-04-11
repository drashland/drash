import Drash from "../../mod.ts";

/**
 * @memberof Drash.Interfaces
 * @interface ResponseOptions
 *
 * @description
 *     views_path?: string
 *
 *         A string that contains the path to the views directory from
 *         your project directory. This must exist if the `views_renderer` property
 *         is set by you. Only needs to be set if you plan to return HTML
 *
 *             views_path: "/public/views/"
 *
 *     views_renderer?: any
 *
 *         dejs' own render method. If you plan on reading and returning HTML
 *         files, whether it's passing in dynamic data or not, you will need
 *         to pass in this property
 *
 *             import { render } from "https://deno.land/x/dejs@0.3.5/mods.ts";
 *             const server = new Drash.Http.Server({
 *               ...
 *               views_renderer: render
 *             })
 */
export interface ResponseOptions {
    views_renderer?: any;
    views_path?: string
}