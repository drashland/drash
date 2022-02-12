import * as Types from "../types.ts";
import { ParameterObjectNonBodyBuilder } from "./parameter_object_non_body_builder.ts";

export class ParameterObjectInPathBuilder
  extends ParameterObjectNonBodyBuilder {
  constructor() {
    super("header");
  }
}
