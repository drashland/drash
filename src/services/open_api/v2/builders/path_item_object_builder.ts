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
    return this.#setMethod("get", operation);
  }

  public post(operation: Builder): this {
    return this.#setMethod("post", operation);
  }

  public put(operation: Builder): this {
    return this.#setMethod("put", operation);
  }

  public delete(operation: Builder): this {
    return this.#setMethod("delete", operation);
  }

  public patch(operation: Builder): this {
    return this.#setMethod("patch", operation);
  }

  public head(operation: Builder): this {
    return this.#setMethod("head", operation);
  }

  public options(operation: Builder): this {
    return this.#setMethod("options", operation);
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

  #setMethod(method: string, operation: Builder): this {
    this.spec[method] = operation.toJson();
    return this;
  }

  public toJson(): any {
    if (this.$ref) {
      return {
        $ref: this.$ref,
      };
    }

    console.log(this.spec);

    return this.spec;
  }
}
