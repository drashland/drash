import * as Drash from "../../../../../mod.ts";
import * as Types from "../types.ts";
import { ParameterObjectBuilder } from "./parameter_object_builder.ts";

export class OperationObjectBuilder {
  #parameters: ParameterObjectBuilder[] = [];

  #spec: Types.OperationObject = {
    responses: {
      200: {
        description: "Successful",
      },
    },
  };

  public parameters(parameters: ParameterObjectBuilder[]): this {
    this.#parameters = parameters;
    return this;
  }

  public responses(responses: any): this {
    this.#spec.responses = responses;
    return this;
  }

  public toJson(): Types.OperationObject {
    this.#validateSpec();

    return {
      ...this.#spec,
      parameters: this.#buildParameters(),
    };
  }

  #validateSpec(): void {
    if (Object.keys(this.#spec.responses).length <= 0) {
      throw new Error("Field `responses` is required. Use `.responses()`.");
    }
  }

  #buildParameters(): Types.ParameterObject[] {
    const built: Types.ParameterObject[] = [];

    this.#parameters.forEach((parameter: ParameterObjectBuilder) => {
      built.push(parameter.toJson());
    });

    return built;
  }
}
