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
 *           const server = new Drash.Http.Server({
 *             ...,
 *             views_path: "/public/views"
 *           })
 *
 *     template_engine?: boolean
 *
 *         True if you wish to use Drash's own template engine to render html files.
 *         The `views_path` property must be set if this is set to true
 *
 *             const server = new Drash.Http.Server({
 *               ...
 *               template_engine: true
 *             })
 */
export interface ResponseOptions {
  views_path?: string;
  template_engine?: boolean;
}
