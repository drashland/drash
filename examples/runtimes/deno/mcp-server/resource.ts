import { Resource } from "jsr:@drashland/drash/modules/http.native";
import { handler } from "./mcp.ts";

export class MCPEndpoint extends Resource {
  public override paths = ["/mcp"];

  // Every MCP message arrives here.
  public override POST(request: Request) {
    return handler.fetch(request);
  }

  // Not MCP methods — these exist so the SDK can answer `405`. Drash answers
  // `501` for a method you did not define, and the spec asks for `405`.
  public override GET(request: Request) {
    return handler.fetch(request);
  }

  public override DELETE(request: Request) {
    return handler.fetch(request);
  }
}
