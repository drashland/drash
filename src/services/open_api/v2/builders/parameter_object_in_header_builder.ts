import { ParameterObjectBuilder } from "./parameter_object_builder.ts";
import { ParameterObjectError } from "../errors/parameter_object_error.ts";
import { IBuilder } from "../interfaces.ts";

export class ParameterInHeaderObjectBuilder extends ParameterObjectBuilder {
  constructor() {
    super("header");
  }

  public type(value: string | IBuilder): this {
    // TODO(crookse):
    // - Must be string, number, integer, boolean, array, or file
    // - If file, then "in" needs to be formData and consumes() is required
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

  public required(): this {
    this.spec.required = true;
    return this;
  }

  public toJson(): any {
    if (!this.spec.type) {
      throw new ParameterObjectError(
        `Parameter of type "header" requires .type() to be called.`,
      );
    }

    return super.toJson();
  }
}
