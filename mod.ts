////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IMPORTS ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

import * as Interfaces from "./src/interfaces.ts";
import * as Types from "./src/types.ts";
import { Server } from "./src/http/server.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - EXPORTS - CLASSES /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export const version = "v2.0.0";

// Dictionaries
export { mimeDb as MimeDb } from "./src/dictionaries/mime_db.ts";

// Errors
export * as Errors from "./src/errors.ts";

// Http
export { DrashRequest } from "./src/http/request.ts";
export { Resource } from "./src/http/resource.ts";
export { DrashResponse } from "./src/http/response.ts";
export { Service } from "./src/http/service.ts";
export type { IContext } from "./src/interfaces.ts";

// Export members from the IMPORTS section above
export { Interfaces, Server, Types };

export type { IResource, IService } from "./src/interfaces.ts";
