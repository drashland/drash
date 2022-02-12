import * as Types from "../types.ts";

export class PrimitiveTypeStringBuilder {
  #spec: Partial<Types.SchemaObject> = {
    type: "string"
  };

  public format(format: Types.DataTypeFormats): this {
    this.#spec.format = format;
    return this;
  }

  public toJson(): Types.SchemaObject {
    return this.#spec;
  }
}