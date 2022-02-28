interface Builder {
  toJson(): any;
}

export class SwaggerObjectBuilder {
  protected spec: Partial<{
    swagger: string;
    info: {
      title: string;
      description: string;
      termsOfService: string;
      contact: {
        name: string;
        url: string;
        email: string;
      };
      license: {
        name: string;
        url: string;
      };
      version: string;
    };
    host: string;
    basePath: string;
    schemes: string[];
    consumes: string[];
    produces: string[];
    paths: {
      [path: string]: Builder;
    };
    definitions: {
      [definition: string]: Builder;
    };
    parameters: {
      [parameter: string]: Builder;
    };
    responses: {
      [response: string]: Builder;
    };
    security_definitions: {
      [security_definition: string]: Builder;
    };
    security: Builder[];
    tags: Builder[];
  }> = {};

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

    this.#buildPathsObject();

    return this.spec;
  }

  #buildPathsObject(): void {
    const paths: any = {};

    for (const [path, pathObjectBuilder] of Object.entries(this.spec.paths!)) {
      paths[path] = pathObjectBuilder.toJson();
    }

    this.spec.paths = paths;
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

  public addPath(path: string, builder: Builder): this {
    // .paths will exist because it is created in the constructor
    this.spec.paths![path] = builder;
    return this;
  }
}
