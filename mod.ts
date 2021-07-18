// FILE MARKER - TS IGNORE NOTES ///////////////////////////////////////////////
//
// NOTE 1
//
// Class properties are ignored to prevent the following TS error:
//
//     Property has no initializer and is not definitely assigned in the
//     constructor.
//
// Class properties are ignored because the class implements ICreateable and is
// instantiated using the Factory class. ICreateable classes do not have
// constructor() implementations. Instead they use factory methods that are
// defined in the ICreateable interface.

// FILE MARKER - IMPORTS ///////////////////////////////////////////////////////

import * as Interfaces from "./src/interfaces.ts";
import { Factory } from "./src/gurus/factory.ts";
import { Server } from "./src/http/server.ts";
import { Service } from "./src/http/service.ts";

// FILE MARKER - EXPORTS ///////////////////////////////////////////////////////

export const version = "v1.5.0";

// Gurus
export { Prototype } from "./src/gurus/prototype.ts";
export { Factory };

// Errors
export * as Errors from "./src/errors.ts";

// Http
export { Request } from "./src/http/request.ts";
export { Resource } from "./src/http/resource.ts";
export { Response } from "./src/http/response.ts";
export { Server, Service };

// Interfaces
export { Interfaces };

// Types
export * as Types from "./src/types.ts";

// Functions
export function createServer(options: Interfaces.IServerOptions = {}): Server {
  return Factory.create(Server, options);
}

// Dependencies
export * as Deps from "./deps.ts";
