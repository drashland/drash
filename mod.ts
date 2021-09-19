////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IMPORTS ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

import * as Interfaces from "./src/interfaces.ts";
import * as Types from "./src/types.ts";
import { Server } from "./src/http/server.ts";

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

// TODO :: Random place, yes i know, but think about using the accept header on the request to check if the request can accept the header on the response
// if not, throw a client error?

// Gurus
export { Prototype } from "./src/gurus/prototype.ts";

// Handlers
export { ResourceHandler } from "./src/handlers/resource_handler.ts";

// Http
export { DrashRequest } from "./src/http/request.ts";
export { Resource } from "./src/http/resource.ts";
export { DrashResponse } from "./src/http/response.ts";
export { Service } from "./src/http/service.ts"
export type {Context as IContext } from "./src/interfaces.ts"

// Export members from the IMPORTS section above
export {
  Interfaces,
  Server,
  Types,
};

import { IService } from "./src/interfaces.ts"
export type { IService }
