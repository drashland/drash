interface Builder {
  toJson(): any;
}

class PathItemObjectError extends Error {
  constructor(message: string) {
    super();
    this.name = this.constructor.name;
    this.message = message;
  }
}

export class PathItemObjectBuilder {
  protected spec: any = {};
  protected $ref?: string;

  public get(operation: Builder): this {
    return this.#setOperation("get", operation);
  }

  public post(operation: Builder): this {
    return this.#setOperation("post", operation);
  }

  public put(operation: Builder): this {
    return this.#setOperation("put", operation);
  }

  public delete(operation: Builder): this {
    return this.#setOperation("delete", operation);
  }

  public patch(operation: Builder): this {
    return this.#setOperation("patch", operation);
  }

  public head(operation: Builder): this {
    return this.#setOperation("head", operation);
  }

  public options(operation: Builder): this {
    return this.#setOperation("options", operation);
  }

  public ref(value: string): this {
    this.$ref = `#/definitions/${value}`;
    return this;
  }

  public parameters(parameters: Builder[]): this {
    const bodyParameters = parameters.filter((param: Builder) => {
      const spec = param.toJson();
      return "in" in spec && spec.in === "body";
    });

    if (bodyParameters && bodyParameters.length > 1) {
      throw new PathItemObjectError(
        `There can be only be one "body" parameter.`,
      );
    }

    this.spec.parameters = parameters.map((param: Builder) => {
      return param.toJson();
    });

    return this;
  }

  #setOperation(method: string, operation: Builder): this {
    this.spec[method] = operation.toJson();
    return this;
  }

  public toJson(): any {
    if (this.$ref) {
      return {
        $ref: this.$ref,
      };
    }

    return this.spec;
  }
}
