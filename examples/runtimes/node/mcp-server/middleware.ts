import { HTTPError, Middleware } from "@drashland/drash/modules/http.polyfill.js";
import { Status } from "@drashland/drash/core/http/response/Status.js";
import type { Context } from "./context.js";

const ALLOWED_ORIGINS = ["https://app.example.com"];

// The spec requires a 403 when `Origin` is present and not allowed. Without
// this, a page on any origin could drive a server running on localhost.
export class OriginGuard extends Middleware {
  public ALL(context: Context) {
    const origin = context.request.headers.origin;

    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      throw new HTTPError(Status.Forbidden, "Origin not allowed");
    }

    return this.next<void>(context);
  }
}
