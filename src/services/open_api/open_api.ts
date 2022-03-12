import * as Drash from "../../../mod.ts";
import { ComputedTypes } from "./deps.ts";
const html = Deno.readFileSync("/var/src/drashland/deno-drash/src/services/open_api/swagger_ui/index.html");
const css = Deno.readFileSync("/var/src/drashland/deno-drash/src/services/open_api/swagger_ui/swagger-ui.css");
const bundle = Deno.readFileSync("/var/src/drashland/deno-drash/src/services/open_api/swagger_ui/swagger-ui-bundle.js");
const standalone = Deno.readFileSync("/var/src/drashland/deno-drash/src/services/open_api/swagger_ui/swagger-ui-standalone-preset.js");
const decoder = new TextDecoder();

let pathToSwaggerUI: string;

interface OpenAPIOptions {
  path: string;
}

interface Schema {
  type: string;
  format?: string;
  additional_properties?: Schema
}

interface Query {
  name: string;
  type: string;
  description: string;
}

interface Method {
  description?: string;
  parameters?: Parameter[][];
  responses?: SpecResponse[];
}

interface SpecMethod {
  parameters?: Parameter[]; // Spec
  tags?: string[];
  summary?: string;
  description?: string;
  operationid?: string;
  produces?: string[];
  responses: {[code: string]: SpecResponse};
}

interface SpecResponse {
  description: string;
  schema: string | Schema
}

interface ResourceSchema {
  [k: string]: Method;
}

interface SwaggerFields {
  schema: ResourceSchema;
}

interface Parameter {
  name: string;
  in?: "body" | "query";
  description: string;
  type?: string;
  required: boolean;
  schema?: Schema;
}

type THandler = (req: Drash.Request, res: Drash.Response) => Promise<void> | void;

export class OpenAPIService extends Drash.Service {
    #options: OpenAPIOptions;

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
  
    constructor(options: OpenAPIOptions) {
      super();
      this.#options = options;
      pathToSwaggerUI = this.#options.path;
    }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - PUBLIC METHODS //////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  runAtStartup(
    server: Drash.Server,
    resources: Drash.Types.TResourcesAndPatterns
  ): void {
    console.log("Building spec");
    this.buildSpec(resources);

    // This comes after `buildSpec()` to prevent the OpenAPI spec from having the Swagger endpoint
    server.addResource(SwaggerUIResource);
  }

  buildSpec(resources: Drash.Types.TResourcesAndPatterns): void {
    const specBuilder = new OpenAPISpecBuilder();

    for (const { resource, patterns } of resources.values()) {
      resource.paths.forEach((path: string) => {
        specBuilder.pathItem(resource as (Drash.Resource & SwaggerFields), path)
      });
    }

    // console.log(specBuilder.build());
  }

  public query(...params: Parameter[]): any {
    return params.map((param: Parameter) => {
      param.in = "query";
      param.type = param.schema!.type;
      delete param.schema;
      return param;
    });
  }

  public body(...params: Parameter[]): any {
    return params.map((param: Parameter) => {
      param.in = "body";
      return param;
    });
  }

  public parameter(
    name: string,
    type: string | Schema,
    description: string,
    required?: boolean
  ): Parameter {
    return {
      name,
      description,
      required: required ?? false,
      schema: typeof type !== "string"
        ? { type: type.type, format: type.format }
        : { type }
    }
  }

  public method(schema: unknown, handler: THandler): THandler {
    return handler; // Return the handler so that Drash.Server can use it
  }

  public model(model: object): object {
    console.log(model);
    return model;
  }

  public response(description: string) {
    return {
      description
    }
  }
}

class SwaggerUIResource extends Drash.Resource {
  public paths = [
    pathToSwaggerUI,
    "/swagger-ui(\.css|-bundle\.js|-standalone-preset\.js)?"
  ];

  public GET(request: Drash.Request, response: Drash.Response) {
    if (request.url.includes(".css")) {
      console.log(request.url);
      return response.send<string>("text/css", decoder.decode(css));
    }
    if (request.url.includes("bundle.js")) {
      console.log(request.url);
      return response.send<string>("application/javascript", decoder.decode(bundle));
    }
    if (request.url.includes("standalone-preset.js")) {
      console.log(request.url);
      return response.send<string>("application/javascript", decoder.decode(standalone));
    }

    return response.html(decoder.decode(html));
  }
}

class OpenAPISpecBuilder {
  public spec: any = {
    "swagger": "2.0",
    "info": {
      "description": "This is a sample server Petstore server.  You can find out more about     Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).      For this sample, you can use the api key `special-key` to test the authorization     filters.",
      "version": "1.0.0",
      "title": "Swagger Petstore",
      "termsOfService": "http://swagger.io/terms/",
      "contact": {
        "email": "apiteam@swagger.io"
      },
      "license": {
        "name": "Apache 2.0",
        "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
      }
    },
    "host": "petstore.swagger.io",
    "basePath": "/v2",
    "tags": [
      {
        "name": "pet",
        "description": "Everything about your Pets",
        "externalDocs": {
          "description": "Find out more",
          "url": "http://swagger.io"
        }
      },
      {
        "name": "store",
        "description": "Access to Petstore orders"
      },
      {
        "name": "user",
        "description": "Operations about user",
        "externalDocs": {
          "description": "Find out more about our store",
          "url": "http://swagger.io"
        }
      }
    ],
    "schemes": [
      "https",
      "http"
    ],
    paths: {}
  };

  public build(): string {
    return JSON.stringify(this.spec, null, 2);
  }

  public pathItem(
    resource: Drash.Resource & SwaggerFields, // Combine that shit
    path: string
  ) {    
    if (!this.spec.paths[path]) {
      this.spec.paths[path] = {};
    }

    const requestMethods = [
      "GET",
      "HEAD",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
    ]

    // requestMethods.forEach((requestMethod: string) => {
    //   // Only document the method if the method exists in the resource. Otherwise, you know... G T F O.
    //   if (requestMethod in resource) {

    //     const method: Method = (resource.schema)
    //       ? resource.schema[requestMethod]
    //       : {responses: []};

    //     // if (!("responses" in schema)) {
    //     //   schema
    //     //     "200": "Successful response."
    //     //   }
    //     // }

    //     if (!("description" in method)) {
    //       method.description = resource.constructor.name;
    //     }

    //     const responses: {[code: string]: SpecResponse} = {};
    //     if ("responses" in method) {
    //       method.responses!.forEach((response: any) => {
    //         responses[response.code] = {
    //           description: response.description,
    //           schema: response.schema,
    //         }
    //       });
    //     }

    //     let parameters: Parameter[] = [];
    //     if ("parameters" in method) {
    //       method.parameters!.forEach((array: Parameter[]) => {
    //         parameters = parameters.concat(array);
    //       });
    //     }

    //     const specMethod: SpecMethod = {
    //       ...method,
    //       parameters,
    //       responses,
    //     }

    //     this.spec.paths[path] = {
    //       ...this.spec.paths[path],
    //       [requestMethod.toLowerCase()]: specMethod
    //     }
    //   }
    // })
  }
}