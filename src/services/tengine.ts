import { Drash } from "../deps.ts";
import { Jae } from "./jae.ts";

interface IOptions {
  render:
    ((...args: unknown[]) => Promise<boolean | string> | boolean | string);
  views_path?: string;
}

export function Tengine(
  options: IOptions,
) {
  let templateEngine: Jae;

  /**
   * The middleware function that's called by Drash.
   *
   * @param request - The request object.
   * @param response - (optional) The response object.
   */
  function tengine(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
  ): void {
    // If there is a response, then we know this is occurring after the request
    response.headers.set("Content-Type", "text/html");

    if (options.views_path) {
      if (!templateEngine) {
        templateEngine = new Jae(options.views_path);
      }
      options.render = (...args: unknown[]): string => {
        return templateEngine.render(
          args[0] as string,
          args[1] as unknown,
        );
      };
    }

    if (response.render) {
      response.render = options.render;
      return;
    }
  }

  return tengine;
}
