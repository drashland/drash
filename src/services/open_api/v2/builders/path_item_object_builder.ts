interface Builder {
  toJson(): any;
}

export class PathItemObjectBuilder {
  protected spec: any = {};

  public get(operation: Builder): this {
    this.spec.get = operation.toJson();
    return this;
  }

  public post(operation: Builder): this {
    this.spec.post = operation.toJson();
    return this;
  }

  public toJson(): any {
    return this.spec;
  }
}
