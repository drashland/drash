import { IBuilder } from "../interfaces.ts";
import { PathItemObjectError } from "../errors.ts";

export class PathItemObjectBuilder {
  protected spec: any = {};
  protected $ref?: string;

  public get(operation: IBuilder): this {
    return this.#setOperation("get", operation);
  }

  public post(operation: IBuilder): this {
    return this.#setOperation("post", operation);
  }

  public put(operation: IBuilder): this {
    return this.#setOperation("put", operation);
  }

  public delete(operation: IBuilder): this {
    return this.#setOperation("delete", operation);
  }

  public patch(operation: IBuilder): this {
    return this.#setOperation("patch", operation);
  }

  public head(operation: IBuilder): this {
    return this.#setOperation("head", operation);
  }

  public options(operation: IBuilder): this {
    return this.#setOperation("options", operation);
  }

  public ref(value: string): this {
    this.$ref = `#/definitions/${value}`;
    return this;
  }

  public parameters(parameters: IBuilder[]): this {
    const bodyParameters = parameters.filter((param: IBuilder) => {
      const spec = param.toJson();
      return "in" in spec && spec.in === "body";
    });

    if (bodyParameters && bodyParameters.length > 1) {
      throw new PathItemObjectError(
        `There can be only be one "body" parameter.`,
      );
    }

    this.spec.parameters = parameters.map((param: IBuilder) => {
      return param.toJson();
    });

    return this;
  }

  #setOperation(method: string, operation: IBuilder): this {
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
