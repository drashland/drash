import { builders } from "../open_api.ts";

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

    // Set defaults
    if (this.spec.in === "path") {
      this.required();
    }
  }

  public name(value: string): this {
    this.spec.name = value;
    return this;
  }

  public description(value: string): this {
    this.spec.description = value;
    return this;
  }

  public required(): this {
    this.spec.required = true;
    return this;
  }

  public toJson(): any {
    if (!this.spec.name) {
      throw new ParameterObjectError(`.name() needs to be called.`);
    }

    return this.spec;
  }
}

export class ParameterInQueryObjectBuilder extends ParameterObjectBuilder {
  constructor() {
    super("query");
  }
}

export class ParameterInBodyObjectBuilder extends ParameterObjectBuilder {
  protected body_spec: any = {};

  constructor() {
    super("body");
  }

  public schema(builder: Builder): this {
    this.body_spec.schema = builder.toJson();
    return this;
  }

  public toJson(): any {
    const spec = super.toJson();

    if (!this.body_spec.schema) {
      throw new ParameterObjectError(
        "Property 'schema' is required. Use `body().schema( ... )` to add it."
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
}
