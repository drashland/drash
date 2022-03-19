import { IBuilder } from "../interfaces.ts";

export class SchemaObjectBuilder {
  public is_required = false;

  protected spec: Partial<{
    type: string;
    collection_format: string;
    properties: {
      [key: string]: IBuilder;
    };
    required: string[];
  }> = {};

  protected $ref?: string;

  constructor(type: string) {
    this.spec.type = type;
  }

  public ref(value: string): this {
    this.$ref = `#/definitions/${value}`;
    return this;
  }

  public properties(properties: any): this {
    if (this.spec.type === "array") {
      throw new Error(
        "Method `.properties()` cannot be used on `array` schema.",
      );
    }

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
      if ("is_required" in value && value.is_required) {
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
