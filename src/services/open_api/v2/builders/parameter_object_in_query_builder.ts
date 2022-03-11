import { ParameterObjectBuilder } from "./parameter_object_builder.ts";
import { ParameterObjectError } from "../errors.ts";
import { IBuilder } from "../interfaces.ts";

export class ParameterInQueryObjectBuilder extends ParameterObjectBuilder {
  constructor() {
    super("query");
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

  public required(): this {
    this.spec.required = true;
    return this;
  }

  public toJson(): any {
    if (!this.spec.type) {
      throw new ParameterObjectError(
        `Parameter of type "query" requires .type() to be called.`,
      );
    }

    return super.toJson();
  }
}
