interface Builder {
  toJson(): any;
}

class OperationObjectError extends Error {
  constructor(message: string) {
    super();
    this.name = this.constructor.name;
    this.message = message;
  }
}

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
      }
    };
  }

  public parameters(parameters: any[]): this {
    this.spec.parameters = parameters.map((param: Builder) => {
      return param.toJson();
    });

    return this;
  }

  public responses(responses: any): this {
    const spec: { [statusCode: string]: any } = {};

    for (const [statusCode, value] of Object.entries(responses)) {
      if (typeof value === "string") {
        spec[statusCode] = {
          description: value,
        };
      } else {
        spec[statusCode] = (value as Builder).toJson();
      }
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
