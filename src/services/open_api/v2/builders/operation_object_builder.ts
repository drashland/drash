import { IBuilder } from "../interfaces.ts";
import { OperationObjectError } from "../errors.ts";

export class OperationObjectBuilder {
  protected spec: any = {};

  constructor() {
    this.spec.responses = {
      200: {
        description: "OK",
      },
      404: {
        description: "Not Found",
      },
      500: {
        description: "Internal Server Error",
      },
    };
  }

  public parameters(parameters: IBuilder[]): this {
    this.spec.parameters = parameters.map((param: IBuilder) => {
      return param.toJson();
    });

    return this;
  }

  public responses(responses: {
    [statusCode: number]: string | IBuilder;
  }): this {
    const spec: { [statusCode: string]: any } = {};

    for (const [statusCode, value] of Object.entries(responses)) {
      // If a string was provided, then just create a basic Response Object
      if (typeof value === "string") {
        spec[statusCode] = {
          description: value,
        };
        continue;
      }

      // Otherwise, we know this is a builder, so build the Response Object
      spec[statusCode] = (value as IBuilder).toJson();
    }

    this.spec.responses = spec;
    return this;
  }

  public toJson(): any {
    // if (!this.spec.responses) {
    //   throw new OperationObjectError(
    //     `.responses() needs to be called.`
    //   );
    // }

    return this.spec;
  }
}
