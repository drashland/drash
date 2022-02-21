// The unknown type can be any type to provide documentation. The explicit types
// are defined by Swagger Specification.
type DataType = "integer" | "long" | "float" | "double" | "string" | "byte" | "binary" | "boolean" | "date" | "dateTime" | "password" | unknown;

interface IBuilder {
  toJson: () => any;
}

export class PrimitiveDataTypeBuilder {
  public is_required = false;

  protected spec: any = {};

  constructor(type: string) {
    this.spec.type = type;
  }

  public format(value: DataType): this {
    this.spec.format = value;
    return this;
  }

  public required(): this {
    this.is_required = true;
    return this;
  }

  public ref(value: string): this {
    this.spec.$ref = `#/definitions/${value}`;
    return this;
  }

  public toJson(): any {
    // If this has $ref, then it should succeed all other fields to prevent
    // invalid specification
    if (this.spec.$ref) {
      return {
        $ref: this.spec.$ref
      };
    }

    return this.spec;
  }
}
