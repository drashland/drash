import type { IncomingMessage, ServerResponse } from "node:http";
import type { RequestMethod } from "@drashland/drash/core/Types.js";

// Node has no `URLPattern` and no `Request`, so the chain gets a context object
// you build. It requires `url` and `method`; everything else on it is yours.
// Both the resource and the middleware read from it, so it lives on its own.
export type Context = {
  url: string;
  method: RequestMethod;
  request: IncomingMessage;
  response: ServerResponse;
};
