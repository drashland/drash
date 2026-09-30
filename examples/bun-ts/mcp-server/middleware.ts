import { HTTPError, Middleware } from "@drashland/drash/modules/http.polyfill.js";
import { Status } from "@drashland/drash/core/http/response/Status.js";

const ALLOWED_ORIGINS = ["https://app.example.com"];

// The spec requires a 403 when `Origin` is present and not allowed. Without
// this, a page on any origin could drive a server running on localhost.
export class OriginGuard extends Middleware {
  public ALL(request: Request) {
    const origin = request.headers.get("origin");

    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      throw new HTTPError(Status.Forbidden, "Origin not allowed");
    }

    return this.next<Response>(request);
  }
}
