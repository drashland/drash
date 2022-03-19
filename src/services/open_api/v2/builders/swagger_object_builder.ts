import { SwaggerObjectSpec } from "../types.ts";

interface Builder {
  toJson(): any;
}

export class SwaggerObjectBuilder {
  protected spec: Partial<SwaggerObjectSpec> = {};

  constructor(spec: any) {
    this.spec = spec;
    if (!this.spec.swagger) {
      this.spec.swagger = "2.0";
    }
    if (!this.spec.paths) {
      this.spec.paths = {};
    }
  }

  // Builder

  public toJson(): any {
    if (!this.spec.info) {
      throw new Error(`Field 'info' is required.`);
    }

    if (!this.spec.info.title) {
      throw new Error(`Field 'info.title' is required.`);
    }

    if (!this.spec.info.version) {
      throw new Error(`Field 'info.version' is required.`);
    }

    if (!this.spec.paths) {
      throw new Error(`Field 'paths' is required.`);
    }

    return this.spec;
  }

  // Public

  public info(info: any): this {
    this.spec.info = info;
    return this;
  }

  public paths(paths: { [path: string]: Builder }): this {
    this.spec.paths = paths;
    return this;
  }

  public addPath(path: string, pathItemObject: Builder): this {
    // Use `!` because `this.spec..paths` will exist. It is created in the
    // constructor.
    this.spec.paths![path] = pathItemObject.toJson();
    return this;
  }
}
