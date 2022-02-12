import * as Types from "../types.ts";
import { ParameterObjectNonBodyBuilder } from "./parameter_object_non_body_builder.ts";

export class ParameterObjectInQueryBuilder
  extends ParameterObjectNonBodyBuilder {
  constructor() {
    super("query");
  }

  public allowEmptyValue(value: boolean): this {
    this.spec.allow_empty_value = value;
    return this;
  }
}
