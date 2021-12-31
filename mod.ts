////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IMPORTS ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

import * as Interfaces from "./src/interfaces.ts";
import * as Types from "./src/types.ts";
import { Server } from "./src/http/server.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - EXPORTS - CLASSES /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function getVersion() {
  const url = import.meta.url;
  if (url.match(/v\d/) === null) {
    return null;
  }
  return "v" + url.split("v")[1].split("/")[0];
}
export const version = getVersion();

// Dictionaries
export { mimeDb as MimeDb } from "./src/dictionaries/mime_db.ts";

// Errors
export * as Errors from "./src/errors.ts";

// Http
export { DrashRequest as Request } from "./src/http/request.ts";
export { Resource } from "./src/http/resource.ts";
export { DrashResponse as Response } from "./src/http/response.ts";
export { Service } from "./src/http/service.ts";

// Export members from the IMPORTS section above
export { Interfaces, Server, Types };

export type { IResource, IService } from "./src/interfaces.ts";
