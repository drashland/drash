/// Member: Drash.Interfaces.Resource

import type { Drash } from "../../mod.ts";

/**
 * Contains the type of Resource.
 *
 * middleware
 *
 *     The list of middleware this resource uses.
 *
 * name
 *
 *     The name of this resource.
 *
 * paths
 *
 *     The list of paths that clients can use to access this resource.
 *
 * paths_parsed
 *
 *     The list of paths parsed into Drash.Interface.ResourcePaths objects. This
 *     is used internally in Drash.Http.Server.
 */
export interface Resource {
  middleware?: { after_request?: []; before_request?: [] };
  name: string;
  paths: string[];
  paths_parsed?: Drash.Interfaces.ResourcePaths[];
}
