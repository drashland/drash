import { ParameterObjectBuilder } from "./parameter_object_builder.ts";
import { ParameterObjectError } from "../errors/parameter_object_error.ts";
import { IBuilder } from "../interfaces.ts";

export class ParameterInPathObjectBuilder extends ParameterObjectBuilder {
  constructor() {
    super("path");
  }

  public type(value: string | IBuilder): this {
    if (this.isBuilder(value)) {
      this.spec = {
        ...this.spec,
        ...value.toJson(),
      };
    } else {
      this.spec.type = value;
    }
    return this;
  }

  public toJson(): any {
    return {
      ...super.toJson(),
      required: true,
    };
  }
}