interface Builder {
  toJson(): any;
}

class ParameterObjectError extends Error {
  constructor(message: string) {
    super();
    this.name = this.constructor.name;
    this.message = message;
  }
}

export class ParameterObjectBuilder {
  protected spec: any = {};

  constructor(location: string) {
    this.spec.in = location;
  }

  public name(value: string): this {
    this.spec.name = value;
    return this;
  }

  public description(value: string): this {
    this.spec.description = value;
    return this;
  }

  public toJson(): any {
    if (!this.spec.name) {
      throw new ParameterObjectError(
        `Parameter of type "${this.spec.in}" requires .name() needs to be called.`,
      );
    }

    return this.spec;
  }

  protected isBuilder(value: unknown): value is Builder {
    return !!value && typeof value === "object" && "toJson" in value;
  }
}

export class ParameterInQueryObjectBuilder extends ParameterObjectBuilder {
  constructor() {
    super("query");
  }

  public type(value: string | Builder): this {
    if (this.isBuilder(value)) {
      this.spec = {
        ...this.spec,
        ...value.toJson(),
      };
    } else {
      this.spec.type = value;
    }
    return this;
  }

  public required(): this {
    this.spec.required = true;
    return this;
  }

  public toJson(): any {
    if (!this.spec.type) {
      throw new ParameterObjectError(
        `Parameter of type "query" requires .type() to be called.`,
      );
    }

    return super.toJson();
  }
}

export class ParameterInBodyObjectBuilder extends ParameterObjectBuilder {
  protected body_spec: any = {};

  constructor() {
    super("body");
  }

  public required(): this {
    this.spec.required = true;
    return this;
  }

  public schema(builder: Builder): this {
    this.body_spec.schema = builder.toJson();
    return this;
  }

  public toJson(): any {
    const spec = super.toJson();

    if (!this.body_spec.schema) {
      throw new ParameterObjectError(
        "Property 'schema' is required. Use `body().schema( ... )` to add it.",
      );
    }

    return {
      ...spec,
      ...this.body_spec,
    };
  }
}

export class ParameterInPathObjectBuilder extends ParameterObjectBuilder {
  constructor() {
    super("path");
  }

  public type(value: string | Builder): this {
    if (this.isBuilder(value)) {
      this.spec = {
        ...this.spec,
        ...value.toJson(),
      };
    } else {
      this.spec.type = value;
    }
    return this;
  }

  public toJson(): any {
    return {
      ...super.toJson(),
      required: true,
    };
  }
}

export class ParameterInHeaderObjectBuilder extends ParameterObjectBuilder {
  constructor() {
    super("header");
  }

  public type(value: string | Builder): this {
    // TODO(crookse):
    // - Must be string, number, integer, boolean, array, or file
    // - If file, then "in" needs to be formData and consumes() is required
    if (this.isBuilder(value)) {
      this.spec = {
        ...this.spec,
        ...value.toJson(),
      };
    } else {
      this.spec.type = value;
    }
    return this;
  }

  public required(): this {
    this.spec.required = true;
    return this;
  }

  public toJson(): any {
    if (!this.spec.type) {
      throw new ParameterObjectError(
        `Parameter of type "header" requires .type() to be called.`,
      );
    }

    return super.toJson();
  }
}

export class ParameterInFormDataObjectBuilder extends ParameterObjectBuilder {
  constructor() {
    super("formData");
  }

  public type(value: string | Builder): this {
    if (this.isBuilder(value)) {
      this.spec = {
        ...this.spec,
        ...value.toJson(),
      };
    } else {
      this.spec.type = value;
    }
    return this;
  }

  public required(): this {
    this.spec.required = true;
    return this;
  }

  public toJson(): any {
    if (!this.spec.type) {
      throw new ParameterObjectError(
        `Parameter of type "formData" requires .type() to be called.`,
      );
    }

    if (this.spec.type === "file" && !this.spec.consumes) {
      throw new ParameterObjectError(
        `Parameter "formData" with "type: file" requires .consumes() to be called.`,
      );
    }

    return super.toJson();
  }
}
