interface Builder {
  is_required?: boolean;
  toJson(): any;
}

export class SchemaObjectBuilder {
  public is_required = false;

  protected spec: Partial<{
    type: string,
    items: Builder,
    $ref: string,
    properties: {
      [key: string]: Builder
    },
    required: string[],
  }> = {};

  constructor(type: "array" | "object") {
    this.spec.type = type;
  }

  public ref(value: string): this {
    this.spec.$ref = `#/definitions/${value}`;
    return this;
  }

  public properties(properties: any): this {
    if (this.spec.type === "array") {
      throw new Error("Method `.properties()` cannot be used on `array` schema.");
    }

    this.spec.properties = properties;
    return this;
  }

  public toJson(): any {
    if (this.spec.$ref) {
      return {
        $ref: this.spec.$ref
      };
    }

    this.#convertPropertiesToJson();
    this.#convertItemsToJson();

    return this.spec;
  }

  public required(): this {
    this.is_required = true;
    return this;
  }

  public items(value: any): this {
    if (this.spec.type === "object") {
      throw new Error("Method `.items()` cannot be used on `object` schema.");
    }

    this.spec.items = value;
    return this;
  }

  #convertItemsToJson(): void {
    if (this.spec.type === "object") {
      return;
    }

    if (this.spec.type === "array" && !this.spec.items) {
      throw new Error("Field `items` is required for `array` schemas.");
    }

    // @ts-ignore
    this.spec.items = this.spec.items.toJson();
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
