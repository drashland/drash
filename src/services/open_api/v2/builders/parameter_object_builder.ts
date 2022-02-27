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
      throw new ParameterObjectError(`.name() needs to be called.`);
    }

    return this.spec;
  }
}

export class ParameterInQueryObjectBuilder extends ParameterObjectBuilder {
  constructor() {
    super("query");
  }

  public type(value: string): this {
    this.spec.type = value;
    return this;
  }

  public required(): this {
    this.spec.required = true;
    return this;
  }

  public toJson(): any {
    if (!this.spec.type) {
      throw new ParameterObjectError(`.type() needs to be called.`);
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

  public type(value: string): this {
    this.spec.type = value;
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

  public type(value: string): this {
    this.spec.type = value;
    return this;
  }

  public required(): this {
    this.spec.required = true;
    return this;
  }

  public toJson(): any {
    if (!this.spec.type) {
      throw new ParameterObjectError(`.type() needs to be called.`);
    }

    return super.toJson();
  }
}

export class ParameterInFormDataObjectBuilder extends ParameterObjectBuilder {
  constructor() {
    super("formData");
  }

  public type(value: string): this {
    this.spec.type = value;
    return this;
  }

  public required(): this {
    this.spec.required = true;
    return this;
  }

  public toJson(): any {
    if (!this.spec.type) {
      throw new ParameterObjectError(`.type() needs to be called.`);
    }

    return super.toJson();
  }
}
