import { IResource } from "../../../interfaces.ts";

export interface IBuilder {
  toJson: () => Record<string, unknown>;
}

export interface IResourceWithSwagger extends IResource {
  /**
   * The specification name the resource belongs to. Example: "DRASH V1.0".
   */
  spec: string;

  /**
   * The operations object that contains specification data about HTTP methods.
   */
  operations?: { [method: string]: any };
}