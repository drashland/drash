import { Factory } from "./src/gurus/factory.ts";
import { Server } from "./src/http/server.ts";
import { Service } from "./src/http/service.ts";

// FILE MARKER - EXPORTS ///////////////////////////////////////////////////////

export const version = "v1.5.0";

// Gurus
export { Factory };

// Errors
export * as Errors from "./src/errors.ts";

// Http
export { Request } from "./src/http/request.ts";
export { Resource } from "./src/http/resource.ts";
export { Response } from "./src/http/response.ts";
export {
  Server,
  Service
};

// Interfaces
import * as Interfaces from "./src/interfaces.ts";
export { Interfaces };

// Types
export * as Types from "./src/types.ts";

// Functions
export function createServer(options: Interfaces.IServerOptions = {}): Server {
  return Factory.create(Server, options);
}
