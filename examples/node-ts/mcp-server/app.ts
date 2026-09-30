import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  Application,
  HTTPError,
  ResourceGroup,
} from "@drashland/drash/modules/http.polyfill.js";
import { Status } from "@drashland/drash/core/http/response/Status.js";
import type { RequestMethod } from "@drashland/drash/core/Types.js";
import { OriginGuard } from "./middleware.js";
import { MCPEndpoint } from "./resource.js";

const group = ResourceGroup
  .builder()
  .resources(MCPEndpoint)
  .middleware(OriginGuard)
  .build();

const app = Application.builder().resources(group).build();

const hostname = "127.0.0.1";
const port = 1447;

createServer((request: IncomingMessage, response: ServerResponse) => {
  app
    .handle<void>({
      url: `http://${hostname}:${port}${request.url}`,
      method: request.method as RequestMethod,
      request,
      response,
    })
    .catch((error: unknown) => {
      // The chain threw before the SDK could answer, so there is no JSON-RPC
      // response yet. Write one, because that is what the client can parse.
      const status = error instanceof HTTPError
        ? error.status_code
        : Status.InternalServerError.code;
      const message = error instanceof HTTPError
        ? error.message
        : "Internal Server Error";

      response.writeHead(status, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32000, message },
          id: null,
        }),
      );
    });
}).listen(port, hostname, () => {
  console.log(`\nDrash MCP server at http://${hostname}:${port}/mcp`);
});
