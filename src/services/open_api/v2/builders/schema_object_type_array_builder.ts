import { SchemaObjectBuilder } from "./schema_object_builder.ts";
import { IBuilder } from "../interfaces.ts";

export class SchemaObjectTypeArrayBuilder extends SchemaObjectBuilder {
  protected object_specific_spec: any = {};

  constructor() {
    super("array");
  }

  public items(value: IBuilder): this {
    this.object_specific_spec.items = value.toJson();
    return this;
  }

  public toJson(): any {
    if (this.$ref) {
      return {
        $ref: this.$ref,
      };
    }

    if (!this.object_specific_spec.items) {
      throw new Error("Field `items` is required for `array` schemas.");
    }

    return {
      ...super.toJson(),
      ...this.object_specific_spec,
    };
  }
}