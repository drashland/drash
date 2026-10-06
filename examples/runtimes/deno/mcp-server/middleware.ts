import { HTTPError, Middleware } from "jsr:@drashland/drash/modules/http.native";
import { Status } from "jsr:@drashland/drash/core/http/response/Status";

const ALLOWED_ORIGINS = ["https://app.example.com"];

// The spec requires a 403 when `Origin` is present and not allowed. Without
// this, a page on any origin could drive a server running on localhost.
export class OriginGuard extends Middleware {
  public override ALL(request: Request) {
    const origin = request.headers.get("origin");

    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      throw new HTTPError(Status.Forbidden, "Origin not allowed");
    }

    return this.next<Response>(request);
  }
}
