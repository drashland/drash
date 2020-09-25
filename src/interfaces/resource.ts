import type { Drash } from "../../mod.ts";

export interface Resource {
  middleware?: { after_request?: []; before_request?: [] };
  name: string;
  paths: string[];
  paths_parsed?: Drash.Interfaces.ResourcePaths[];
}
