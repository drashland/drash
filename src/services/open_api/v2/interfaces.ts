import * as Drash from "../../../../mod.ts";
import { ResourceOperation } from "./types.ts";

export interface IBuilder {
  is_required?: boolean;
  toJson: () => Record<string, unknown>;
}

export interface IServiceOptions {
  /** Path to the Swagger UI page. Defaults to "/swagger-ui". */
  swagger: {
    info: {
      title: string;
      version: string;
    };
  };
  /**
   * Path to the Swagger UI resource. Defaults to "/swagger-ui" if not defined.
   */
  path_to_swagger_ui?: string;
}

export interface IResource extends Drash.Interfaces.IResource {
  spec?: string;
  operations?: {
    [method: string]: ResourceOperation;
  };
}
