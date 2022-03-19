import { DataType } from "../types.ts";

/**
 * A builder to help build a Data Type spec.
 */
export class DataTypeBuilder {
  /**
   * Is this Data Type required? This property helps other builders build out
   * their spec. For example, when this Data Type is required and is
   * used in `SchemaObjectBuilder`, then `SchemaObjectBuilder` will check this
   * property and set its `required` field in its specto include this
   * Data Type.
   */
  public is_required = false;

  /**
   * A property to hold the Data Type spec
   */
  protected spec: any = {};

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   */
  constructor(type: string) {
    this.spec.type = type;
    this.#setDefaults();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Set this Data Type's spec's `format` field.
   *
   * @return this
   */
  public format(value: DataType): this {
    this.spec.format = value;
    return this;
  }

  /**
   * Set this Data Type's spec's `$ref` field.
   *
   * @return this
   */
  public ref(value: string): this {
    this.spec.$ref = `#/definitions/${value}`;
    return this;
  }

  /**
   * Set this Data Type as being required in the spec.
   *
   * @return this
   */
  public required(): this {
    this.is_required = true;
    return this;
  }

  /**
   * Convert this Data Type specto JSON.
   *
   * @returns This Data Type's specas JSON.
   */
  public toJson(): any {
    // If this Data Type has `$ref` defined, then use and return that. The
    // `$ref` field succeeds all other fields to prevent an invalid spec.
    if (this.spec.$ref) {
      return {
        $ref: this.spec.$ref,
      };
    }

    return this.spec;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Set the defaults for this data type.
   */
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
}
