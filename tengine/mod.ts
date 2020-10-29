import { Drash } from "../deps.ts";

interface ITengineOptions {
  render: (...args: any[]) => Promise<string|void>;
}

/**
 */
export function Tengine(
  options: ITengineOptions
) {

  /**
   * The middleware function that's called by Drash.
   *
   * @param request - The request object.
   * @param response - (optional) The response object.
   */
  function tengine(
    request: Drash.Http.Request,
    response?: Drash.Http.Response,
  ): void {
    // If there is a response, then we know this is occurring after the request
    if (response) {
      response.headers.set("Content-Type", "text/html");
    }
  }

  tengine.render = async function(...args: unknown[]): Promise<string> {
    return await options.render(args) as unknown as string;
  }

  return tengine;
}
