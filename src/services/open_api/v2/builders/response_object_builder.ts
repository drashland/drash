interface Builder {
  toJson(): any;
}

export class ResponseObjectBuilder {
  protected spec: any = {};

  public description(value: string): this {
    this.spec.description = value;
    return this;
  }

  public toJson(): any {
    return this.spec;
  }
}
