import { SchemaObjectBuilder } from "./schema_object_builder.ts";
import { IBuilder } from "../interfaces.ts";
import { SchemaObjectSpec } from "../types.ts";

export class SchemaObjectTypeArrayBuilder extends SchemaObjectBuilder {
  protected object_specific_spec: any = {};

  constructor() {
    super("array");
  }

  /**
   * Set the `items` field in spec.
   *
   * @returns This object to chain methods.
   */
  public items(value: IBuilder): this {
    this.object_specific_spec.items = value.toJson();
    return this;
  }

  /**
   * Turn this builder into the JSON version of the spec.
   *
   * @return A Schema Object spec as JSON.
   */
  public toJson(): SchemaObjectSpec {
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
