import * as Types from "../types.ts";

export class ItemsObjectWithJsonSchemaValidationBuilder {
  public spec: Partial<Types.ItemsObject> = {};

  public title(title: string): this {
    this.spec.title = title;
    return this;
  }

  public maximum(maximum: number): this {
    this.spec.maximum = maximum;
    return this;
  }

  public exclusiveMaximum(value: boolean): this {
    this.spec.exclusive_maximum = value;
    return this;
  }

  public minimum(value: number): this {
    this.spec.minimum = value;
    return this;
  }

  public exclusiveMinimum(value: boolean): this {
    this.spec.exclusive_minimum = value;
    return this;
  }

  public maxLength(value: number): this {
    this.spec.max_length = value;
    return this;
  }

  public minLength(value: number): this {
    this.spec.min_length = value;
    return this;
  }

  public pattern(value: string): this {
    this.spec.pattern = value;
    return this;
  }

  public maxItems(value: number): this {
    this.spec.max_items = value;
    return this;
  }

  public minItems(value: number): this {
    this.spec.min_items = value;
    return this;
  }

  public uniqueItems(value: boolean): this {
    this.spec.unique_items = value;
    return this;
  }

  public enum(value: unknown[]): this {
    this.spec.enum = value;
    return this;
  }

  public multipleOf(value: number): this {
    this.spec.multiple_of = value;
    return this;
  }

  public toJson(): Types.ItemsObject {
    return this.spec as Types.ItemsObject;
  }
}
