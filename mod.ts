////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IMPORTS ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

import * as Interfaces from "./src/interfaces.ts";
import * as Types from "./src/types.ts";
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
export { ResourceHandler } from "./src/handlers/resource_handler.ts";

// Http
export { DrashRequest } from "./src/http/request.ts";
export { DrashResource } from "./src/http/resource.ts";
export { DrashResponse } from "./src/http/response.ts";

// Export members from the IMPORTS section above
export {
  Interfaces,
  Server,
  Service,
  Types,
};
