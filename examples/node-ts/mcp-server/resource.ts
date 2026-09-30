import { Resource } from "@drashland/drash/modules/http.polyfill.js";
import type { Context } from "./context.js";
import { mcp } from "./mcp.js";

export class MCPEndpoint extends Resource {
  public paths = ["/mcp"];

  // Every MCP message arrives here.
  public POST(context: Context) {
    return mcp(context.request, context.response);
  }

  // Not MCP methods — these exist so the SDK can answer `405`. Drash answers
  // `501` for a method you did not define, and the spec asks for `405`.
  public GET(context: Context) {
    return mcp(context.request, context.response);
  }

  public DELETE(context: Context) {
    return mcp(context.request, context.response);
  }
}
