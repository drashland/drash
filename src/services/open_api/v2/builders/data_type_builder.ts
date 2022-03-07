import { TDataType } from "../types.ts";

export class DataTypeBuilder {
  public is_required = false;

  protected spec: any = {};

  constructor(type: string) {
    this.spec.type = type;
    this.#setDefaults();
  }

  #setDefaults(): void {
    let format: string | undefined;

    switch (this.spec.type) {
      case "string":
        break;
      case "integer":
        format = "int32";
        break;
      case "long":
        format = "int64";
        break;
      case "float":
        format = "float";
        break;
      case "double":
        format = "double";
        break;
      case "byte":
        format = "byte";
        break;
      case "binary":
        format = "binary";
        break;
      case "boolean":
        break;
      case "date":
        format = "date";
        break;
      case "dateTime":
        format = "date-time";
        break;
      case "password":
        format = "password";
        break;
      default:
        break;
    }

    if (format) {
      this.spec.format = format;
    }
  }

  public format(value: TDataType): this {
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
        $ref: this.spec.$ref,
      };
    }

    return this.spec;
  }
}
