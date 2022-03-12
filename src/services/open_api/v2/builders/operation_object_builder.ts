interface Builder {
  toJson(): any;
}

export class OperationObjectBuilder {
  protected spec: any = {};

  public parameters(parameters: any[]): this {
    this.spec.parameters = parameters.map((param: Builder) => {
      return param.toJson();
    });

    return this;
  }

  public responses(responses: any): this {
    const spec: {[statusCode: string]: any} = {};

    for (const [statusCode, value] of Object.entries(responses)) {
      if (typeof value === "string") {
        spec[statusCode] = {
          description: value
        };
      } else {
        spec[statusCode] = (value as Builder).toJson();
      }
    }

    this.spec.responses = spec;
    return this;
  }

  public toJson(): any {
    return this.spec;
  }
}
