import * as Drash from "../../../../mod.ts";
import { TResourceOperationSpec } from "./types.ts";

export interface IBuilder {
  toJson: () => Record<string, unknown>;
}

export interface IServiceOptions {
  /** Path to the Swagger UI page. Defaults to "/swagger-ui". */
  swagger?: {
    title?: string;
    version?: string;
  };
  /**
   * Path to the Swagger UI resource. Defaults to "/swagger-ui" if not defined.
   */
  path_to_swagger_ui?: string;
}

export interface IResource extends Drash.Interfaces.IResource {
  spec?: string;
  operations?: {
    [method: string]: TResourceOperationSpec;
  };
}
