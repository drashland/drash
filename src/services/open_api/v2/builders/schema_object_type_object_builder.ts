import { SchemaObjectBuilder } from "./schema_object_builder.ts";
import { IBuilder } from "../interfaces.ts";

export class SchemaObjectTypeObjectBuilder extends SchemaObjectBuilder {
  constructor() {
    super("object");
  }

  public properties(properties: any): this {
    this.spec.properties = properties;
    return this;
  }

  public toJson(): any {
    if (this.$ref) {
      return {
        $ref: this.$ref,
      };
    }

    this.#convertPropertiesToJson();

    return this.spec;
  }

  public required(): this {
    this.is_required = true;
    return this;
  }

  #convertPropertiesToJson(): void {
    if (!this.spec.properties) {
      return;
    }

    const properties: any = {};

    for (const [key, value] of Object.entries(this.spec.properties)) {
      properties[key] = value.toJson();
      // Add this property to the `required` array if it is required
      if (value.is_required) {
        // Create the `required` array if it does not exist yet
        if (!this.spec.required) {
          this.spec.required = [];
        }
        this.spec.required.push(key);
      }
    }

    this.spec.properties = properties;
  }
}
