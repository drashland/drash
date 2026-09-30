import {
  Application,
  HTTPError,
  ResourceGroup,
} from "jsr:@drashland/drash/modules/http.native";
import { Status } from "jsr:@drashland/drash/core/http/response/Status";
import { OriginGuard } from "./middleware.ts";
import { MCPEndpoint } from "./resource.ts";

const group = ResourceGroup
  .builder()
  .resources(MCPEndpoint)
  .middleware(OriginGuard)
  .build();

const app = Application.builder().resources(group).build();

Deno.serve({
  hostname: "localhost",
  port: 1447,
  onListen: ({ hostname, port }) => {
    console.log(`\nDrash MCP server at http://${hostname}:${port}/mcp`);
  },
  handler: (request: Request): Promise<Response> => {
    return app
      .handle<Response>(request)
      .catch(mcpErrorResponse);
  },
});

// The chain threw before the SDK could answer, so there is no JSON-RPC
// response yet. Write one, because that is what the client can parse.
function mcpErrorResponse(error: unknown): Response {
  const status = error instanceof HTTPError
    ? error.status_code
    : Status.InternalServerError.code;
  const message = error instanceof HTTPError
    ? error.message
    : "Internal Server Error";

  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message },
      id: null,
    }),
    { status, headers: { "content-type": "application/json" } },
  );
}
