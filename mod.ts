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

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IMPORTS ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

import * as Interfaces from "./src/interfaces.ts";
import * as Types from "./src/types.ts";
import { Factory } from "./src/gurus/factory.ts";
import { Server } from "./src/http/server.ts";
import { Service } from "./src/http/service.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - EXPORTS - CLASSES /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export const version = "v1.5.0";

// Dictionaries
export { mimeDb as MimeDb } from "./src/dictionaries/mime_db.ts";

// Deps
export * as Deps from "./deps.ts";

// Errors
export * as Errors from "./src/errors.ts";

// Gurus
export { Prototype } from "./src/gurus/prototype.ts";

// Handlers
export { MiddlewareHandler } from "./src/handlers/middleware_handler.ts";
export { ResourceHandler } from "./src/handlers/resource_handler.ts";

// Http
export { Request } from "./src/http/request.ts";
export { Resource } from "./src/http/resource.ts";
export { Response } from "./src/http/response.ts";

// Export members from the IMPORTS section above
export {
  Factory,
  Interfaces,
  Server,
  Service,
  Types,
};

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - EXPORTS - FUNCTIONS ///////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Create a Drash HTTP/HTTPS server.
 */
export function createServer(options: Interfaces.IServerOptions = {}): Server {
  return Factory.create(Server, options);
}
