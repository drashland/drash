import { Drash } from "../../../../mod.ts";

export function AfterResourceMiddleware(
  req: Drash.Http.Request,
  res: Drash.Http.Response
) {
  res.render = (...args: unknown[]): string | boolean => {
    res.headers.set("Content-Type", "text/html");
    return JSON.stringify(args);
  }
}
