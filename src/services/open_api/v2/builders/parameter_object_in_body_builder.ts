import { ParameterObjectBuilder } from "./parameter_object_builder.ts";
import { ParameterObjectError } from "../errors.ts";
import { IBuilder } from "../interfaces.ts";

export class ParameterInBodyObjectBuilder extends ParameterObjectBuilder {
  protected body_spec: any = {};

  constructor() {
    super("body");
  }

  public required(): this {
    this.spec.required = true;
    return this;
  }

  public schema(builder: IBuilder): this {
    this.body_spec.schema = builder.toJson();
    return this;
  }

  public toJson(): any {
    const spec = super.toJson();

    if (!this.body_spec.schema) {
      throw new ParameterObjectError(
        "Property 'schema' is required. Use `body().schema( ... )` to add it.",
      );
    }

    return {
      ...spec,
      ...this.body_spec,
    };
  }
}
