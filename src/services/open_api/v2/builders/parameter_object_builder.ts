import { ParameterObjectError } from "../errors.ts";
import { IBuilder } from "../interfaces.ts";
import { isBuilder } from "./spec_builder.ts";

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

  protected isBuilder(value: unknown): value is IBuilder {
    return isBuilder(value);
  }
}
