import * as Types from "../types.ts";

export abstract class ParameterObjectBuilder {
  spec: Partial<Types.ParameterObject> & {
    [key: string]: unknown;
  } = {};

  constructor(inType: Types.ParameterInTypes) {
    this.spec.in = inType;
  }

  public name(value: string): this {
    this.spec.name = value;
    return this;
  }

  public description(desc: string): this {
    this.spec.description = desc;
    return this;
  }

  public required(): this {
    this.spec.required = true;
    return this;
  }

  abstract toJson(): Types.ParameterObject;

  public format(format: Types.DataTypeFormats): this {
    this.spec.format = format;
    return this;
  }

  protected validateSpec(): void {
    if (!this.spec.name) {
      throw new Error(`Field 'name' is required. Use \`.name()\`.`);
    }
  }
}
