import { Resource } from "@drashland/drash/modules/http.native.js";
import { handler } from "./mcp.ts";

export class MCPEndpoint extends Resource {
  public paths = ["/mcp"];

  // Every MCP message arrives here.
  public POST(request: Request) {
    return handler.fetch(request);
  }

  // Not MCP methods — these exist so the SDK can answer `405`. Drash answers
  // `501` for a method you did not define, and the spec asks for `405`.
  public GET(request: Request) {
    return handler.fetch(request);
  }

  public DELETE(request: Request) {
    return handler.fetch(request);
  }
}
