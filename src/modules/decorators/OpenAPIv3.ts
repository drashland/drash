/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
 * AUTHORS file at <https://github.com/drashland/drash/AUTHORS>. This notice
 * applies to Drash version 3.X.X and any later version.
 *
 * This file is part of Drash. See <https://github.com/drashland/drash>.
 *
 * Drash is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * Drash is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Drash. If not, see <https://www.gnu.org/licenses/>.
 */

// Imports > Core
import { Method } from "../../core/http/request/Method.ts";
import type { RequestMethod } from "../../core/types/RequestMethod.ts";

/**
 * A `$ref` pointer to a component defined elsewhere in the document.
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#reference-object}
 */
type ReferenceObject = {
  $ref: string;
};

/**
 * @see {@link https://spec.openapis.org/oas/v3.0.3#external-documentation-object}
 */
type ExternalDocumentationObject = {
  description?: string;
  url: string;
};

/**
 * @see {@link https://spec.openapis.org/oas/v3.0.3#server-object}
 */
type ServerObject = {
  url: string;
  description?: string;
  variables?: Record<string, {
    enum?: string[];
    default: string;
    description?: string;
  }>;
};

/**
 * A JSON Schema, as OpenAPI profiles it.
 *
 * Deliberately open at the edges: the spec allows any JSON Schema keyword plus
 * `x-` extensions, and enumerating all of them here would date this file
 * against every future draft without making the common cases any safer.
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#schema-object}
 */
type SchemaObject = {
  type?:
    | "array"
    | "boolean"
    | "integer"
    | "number"
    | "object"
    | "string";
  format?: string;
  title?: string;
  description?: string;
  default?: unknown;
  example?: unknown;
  enum?: unknown[];
  nullable?: boolean;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  /** Required for `type: "array"`. */
  items?: SchemaObject | ReferenceObject;
  properties?: Record<string, SchemaObject | ReferenceObject>;
  additionalProperties?: boolean | SchemaObject | ReferenceObject;
  /** Names of required properties, not a boolean. */
  required?: string[];
  allOf?: (SchemaObject | ReferenceObject)[];
  anyOf?: (SchemaObject | ReferenceObject)[];
  oneOf?: (SchemaObject | ReferenceObject)[];
  not?: SchemaObject | ReferenceObject;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  multipleOf?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  minProperties?: number;
  maxProperties?: number;
  [extension: `x-${string}`]: unknown;
};

/**
 * @see {@link https://spec.openapis.org/oas/v3.0.3#example-object}
 */
type ExampleObject = {
  summary?: string;
  description?: string;
  value?: unknown;
  externalValue?: string;
};

/**
 * @see {@link https://spec.openapis.org/oas/v3.0.3#encoding-object}
 */
type EncodingObject = {
  contentType?: string;
  headers?: Record<string, HeaderObject | ReferenceObject>;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
};

/**
 * One media type of a request or response body, keyed by content type.
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#media-type-object}
 */
type MediaTypeObject = {
  schema?: SchemaObject | ReferenceObject;
  example?: unknown;
  examples?: Record<string, ExampleObject | ReferenceObject>;
  encoding?: Record<string, EncodingObject>;
};

/**
 * A parameter with its `name` and `in` removed — a response header is
 * identified by its key in the map it lives in, not by a `name` field.
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#header-object}
 */
type HeaderObject = Omit<ParameterObject, "name" | "in">;

/**
 * @see {@link https://spec.openapis.org/oas/v3.0.3#parameter-object}
 */
type ParameterObject = {
  name: string;
  in: "cookie" | "header" | "path" | "query";
  description?: string;
  /**
   * Must be `true` when `in` is `"path"`. {@link buildPathsObject} sets this
   * for the path parameters it derives.
   */
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: SchemaObject | ReferenceObject;
  example?: unknown;
  examples?: Record<string, ExampleObject | ReferenceObject>;
  content?: Record<string, MediaTypeObject>;
};

/**
 * @see {@link https://spec.openapis.org/oas/v3.0.3#request-body-object}
 */
type RequestBodyObject = {
  description?: string;
  content: Record<string, MediaTypeObject>;
  required?: boolean;
};

/**
 * @see {@link https://spec.openapis.org/oas/v3.0.3#link-object}
 */
type LinkObject = {
  operationRef?: string;
  operationId?: string;
  parameters?: Record<string, unknown>;
  requestBody?: unknown;
  description?: string;
  server?: ServerObject;
};

/**
 * @see {@link https://spec.openapis.org/oas/v3.0.3#response-object}
 */
type ResponseObject = {
  /** The only required field on a response. */
  description: string;
  headers?: Record<string, HeaderObject | ReferenceObject>;
  content?: Record<string, MediaTypeObject>;
  links?: Record<string, LinkObject | ReferenceObject>;
};

/**
 * Responses keyed by status code, or by `"default"`.
 *
 * Codes are strings in the document, not numbers — `"404"`, not `404` — and
 * may use the `1XX`–`5XX` wildcard form.
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#responses-object}
 */
type ResponsesObject = {
  [statusCode: string]: ResponseObject | ReferenceObject;
};

/**
 * @see {@link https://spec.openapis.org/oas/v3.0.3#callback-object}
 */
type CallbackObject = {
  [expression: string]: PathItemObject;
};

/**
 * Security schemes that apply, each naming the scopes it needs.
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#security-requirement-object}
 */
type SecurityRequirementObject = Record<string, string[]>;

/**
 * What a single HTTP method on a single path does. This is the shape
 * {@link OpenAPI} takes.
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#operation-object}
 */
type OperationObject = {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  /** Must be unique across the whole document if given. */
  operationId?: string;
  parameters?: (ParameterObject | ReferenceObject)[];
  requestBody?: RequestBodyObject | ReferenceObject;
  /**
   * Required by OpenAPI 3.0. Optional here so a resource can be annotated
   * incrementally; a document assembled from operations with no `responses`
   * will not validate against 3.0.
   */
  responses?: ResponsesObject;
  callbacks?: Record<string, CallbackObject | ReferenceObject>;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
  [extension: `x-${string}`]: unknown;
};

/**
 * One path, with an operation per HTTP method defined on it.
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#path-item-object}
 */
type PathItemObject = {
  summary?: string;
  description?: string;
  servers?: ServerObject[];
  parameters?: (ParameterObject | ReferenceObject)[];
  connect?: OperationObject;
  delete?: OperationObject;
  get?: OperationObject;
  head?: OperationObject;
  options?: OperationObject;
  patch?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  trace?: OperationObject;
};

/**
 * The `paths` member of an OpenAPI document. {@link buildPathsObject} returns
 * this.
 *
 * @see {@link https://spec.openapis.org/oas/v3.0.3#paths-object}
 */
type PathsObject = Record<string, PathItemObject>;

/**
 * The shape of a resource's HTTP method. Matches the core `Resource`, whose
 * methods take an unknown input and return an unknown output.
 */
type ResourceMethod = (...args: never[]) => unknown;

/**
 * Anything with a `paths` array and HTTP methods — that is, an instance of the
 * core `Resource` or of any chain's `Resource`.
 *
 * Structural on purpose. Importing the concrete class would drag a `core`
 * dependency into every consumer of these types for no gain, and would stop
 * this working with a resource that only structurally matches.
 */
type ResourceLike = {
  paths: string[];
};

/**
 * A resource class, as passed to a chain builder.
 */
type ResourceClass = new (...args: never[]) => ResourceLike;

/**
 * Operations, keyed by the method they decorate.
 *
 * A `WeakMap` rather than a property on the function: decorating must not
 * change the method it decorates. Writing to the function would make the
 * metadata visible to anything enumerating the prototype, and would be
 * inherited by subclasses that override the method — which would silently
 * attribute the parent's documentation to the child's implementation.
 *
 * The key is the method itself, and {@link OpenAPI} returns that same function
 * unchanged, so `Users.prototype.GET` is the key that was registered.
 */
const registryKey = Symbol.for("drash.openapi.operations");

/**
 * The one registry, shared by every copy of this module in the process.
 *
 * A plain module-level `WeakMap` is not enough. A bundler inlining this module
 * into a resource file, a package installed at two versions, or a project
 * loading both the CJS and the ESM build all produce more than one copy — and
 * each copy would get its own map. The decorator would write to one and
 * {@link getOperations} would read another, reporting every resource as
 * undocumented with nothing to explain why.
 *
 * `Symbol.for` looks up the process-wide symbol registry, so every copy
 * resolves the same key and the first one to load creates the map the rest
 * reuse.
 */
function getRegistry(): WeakMap<ResourceMethod, OperationObject> {
  const host = globalThis as unknown as Record<symbol, unknown>;
  const existing = host[registryKey] as
    | WeakMap<ResourceMethod, OperationObject>
    | undefined;

  if (existing) {
    return existing;
  }

  const registry = new WeakMap<ResourceMethod, OperationObject>();
  host[registryKey] = registry;

  return registry;
}

const operations = getRegistry();

/**
 * The HTTP method names a resource can define, lowercased to the casing the
 * OpenAPI Path Item Object uses.
 */
const methodNames = new Set<string>(Object.keys(Method));

/**
 * Document a resource's HTTP method with an OpenAPI v3 Operation Object.
 *
 * The object is stored, not validated and not acted on at request time. It is
 * read back by {@link getOperation}, {@link getOperations}, and
 * {@link buildPathsObject}, which is what turns a set of annotated resources
 * into the `paths` member of a document you can serialise to YAML or JSON.
 *
 * @param operation The Operation Object describing this method.
 * @returns The method decorator.
 *
 * @example
 * ```ts
 * class Users extends Resource {
 *   public override paths = ["/users/:id"];
 *
 *   @OpenAPIv3({
 *     summary: "Get a user",
 *     responses: {
 *       "200": {
 *         description: "The user",
 *         content: {
 *           "application/json": {
 *             schema: { type: "object" },
 *           },
 *         },
 *       },
 *     },
 *   })
 *   public override GET(request: Request) {
 *     return new Response("...");
 *   }
 * }
 * ```
 */
function OpenAPIv3(operation: OperationObject) {
  return function <T extends ResourceMethod>(
    value: T,
    context: ClassMethodDecoratorContext,
  ): T {
    if (context.kind !== "method") {
      throw new TypeError(
        `OpenAPIv3: can only decorate a method, but was used on a ${context.kind}.`,
      );
    }

    if (context.static) {
      throw new TypeError(
        `OpenAPIv3: can only decorate an instance method, but \`${
          String(context.name)
        }\` is static.`,
      );
    }

    // A private method is unreachable from the prototype, so nothing could
    // read the operation back off it. Better to say so at decoration time than
    // to leave it silently missing from the generated document.
    if (context.private) {
      throw new TypeError(
        `OpenAPIv3: can only decorate a public method, but \`${
          String(context.name)
        }\` is private.`,
      );
    }

    const name = String(context.name);

    if (!methodNames.has(name)) {
      throw new TypeError(
        `OpenAPIv3: \`${name}\` is not an HTTP method. Decorate one of: ${
          [...methodNames].join(", ")
        }.`,
      );
    }

    operations.set(value, operation);

    return value;
  };
}

/**
 * Get the Operation Object a method was decorated with.
 *
 * @param method The method to look up, e.g. `Users.prototype.GET`.
 * @returns The operation, or `undefined` if the method was not decorated.
 */
function getOperation(
  method: ResourceMethod | undefined,
): OperationObject | undefined {
  if (!method) {
    return undefined;
  }

  return operations.get(method);
}

/**
 * Get every documented operation on a resource, keyed by HTTP method name.
 *
 * Walks the prototype chain, so a resource that inherits a decorated method
 * from a base class reports it. An override that is not itself decorated is
 * reported as undocumented rather than inheriting the parent's operation —
 * different implementation, different documentation.
 *
 * @param resource The resource class to read.
 * @returns The operations found, keyed by HTTP method name (`"GET"`, ...).
 */
function getOperations(
  resource: ResourceClass,
): Partial<Record<RequestMethod, OperationObject>> {
  const found: Partial<Record<RequestMethod, OperationObject>> = {};

  for (const name of methodNames) {
    const method = (resource.prototype as Record<string, unknown>)[name];

    if (typeof method !== "function") {
      continue;
    }

    const operation = operations.get(method as ResourceMethod);

    if (operation) {
      found[name as RequestMethod] = operation;
    }
  }

  return found;
}

/**
 * Rewrite one of Drash's paths into the OpenAPI form, and name its parameters.
 *
 * Drash matches with `URLPattern`, so a path parameter is `:id`. OpenAPI wants
 * `{id}`. An optional parameter (`:id?`) has no OpenAPI equivalent — a path
 * parameter there is always required — so it expands into two paths, one with
 * the parameter and one without, which is how the same two URLs are expressed
 * in a document.
 *
 * @param path The resource path, e.g. `/users/:id?`.
 * @returns One entry per OpenAPI path, each with the parameter names it takes.
 */
function toOpenAPIPaths(
  path: string,
): { path: string; parameters: string[] }[] {
  // Splitting "/users/:id" yields a leading "" for the root slash, and a
  // trailing "" for a path written with one. Dropping the empties lets every
  // segment below be joined the same way, with the slash always in front.
  const segments = path.split("/").filter((segment) => segment !== "");
  const results: { path: string; parameters: string[] }[] = [{
    path: "",
    parameters: [],
  }];

  for (const segment of segments) {
    if (!segment.startsWith(":")) {
      for (const result of results) {
        result.path += `/${segment}`;
      }
      continue;
    }

    const optional = segment.endsWith("?");
    const name = segment.slice(1, optional ? -1 : undefined);

    if (optional) {
      // Keep the shorter path as it stands, and branch a longer one that
      // carries the parameter.
      for (const result of [...results]) {
        results.push({
          path: `${result.path}/{${name}}`,
          parameters: [...result.parameters, name],
        });
      }
      continue;
    }

    for (const result of results) {
      result.path += `/{${name}}`;
      result.parameters.push(name);
    }
  }

  return results.map((result) => ({
    path: result.path === "" ? "/" : result.path,
    parameters: result.parameters,
  }));
}

/**
 * Build the `paths` member of an OpenAPI v3 document from annotated resources.
 *
 * Each resource contributes one entry per path it answers to, and one
 * operation per decorated HTTP method. Path parameters are derived from the
 * path itself and merged ahead of the operation's own `parameters`, so a
 * parameter you describe yourself — to give it a schema or a description —
 * wins over the generated stub.
 *
 * Resources with no decorated methods contribute nothing, so adding this to an
 * existing app documents only what you have annotated so far.
 *
 * Serialise the result yourself. The document also needs `openapi`, `info`,
 * and whatever else you want; this fills in the part that can be derived from
 * the resources.
 *
 * @param resources The resource classes to read.
 * @returns The Paths Object.
 *
 * @example
 * ```ts
 * const paths = buildPathsObject([Users, Home]);
 *
 * const document = {
 *   openapi: "3.0.3",
 *   info: { title: "My API", version: "1.0.0" },
 *   paths,
 * };
 * ```
 */
function buildPathsObject(resources: ResourceClass[]): PathsObject {
  const paths: PathsObject = {};

  for (const resource of resources) {
    const found = getOperations(resource);

    if (Object.keys(found).length === 0) {
      continue;
    }

    // `paths` is an instance field, so it takes constructing the resource to
    // read it. Resources are constructed per request by the chain anyway, so
    // this matches how they are already used.
    const instance = new resource();

    for (const path of instance.paths) {
      for (const { path: openAPIPath, parameters } of toOpenAPIPaths(path)) {
        const item: PathItemObject = paths[openAPIPath] ?? {};

        for (const [name, operation] of Object.entries(found)) {
          const described = new Set(
            (operation.parameters ?? [])
              .filter((parameter): parameter is ParameterObject =>
                !("$ref" in parameter) && parameter.in === "path"
              )
              .map((parameter) => parameter.name),
          );

          const derived: ParameterObject[] = parameters
            .filter((parameter) => !described.has(parameter))
            .map((parameter) => ({
              name: parameter,
              in: "path",
              required: true,
              schema: { type: "string" },
            }));

          const merged = [...derived, ...(operation.parameters ?? [])];

          item[name.toLowerCase() as Lowercase<RequestMethod>] = merged.length
            ? { ...operation, parameters: merged }
            : operation;
        }

        paths[openAPIPath] = item;
      }
    }
  }

  return paths;
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export {
  buildPathsObject,
  type CallbackObject,
  type EncodingObject,
  type ExampleObject,
  type ExternalDocumentationObject,
  getOperation,
  getOperations,
  type HeaderObject,
  type LinkObject,
  type MediaTypeObject,
  OpenAPIv3,
  type OperationObject,
  type ParameterObject,
  type PathItemObject,
  type PathsObject,
  type ReferenceObject,
  type RequestBodyObject,
  type ResourceClass,
  type ResourceLike,
  type ResourceMethod,
  type ResponseObject,
  type ResponsesObject,
  type SchemaObject,
  type SecurityRequirementObject,
  type ServerObject,
};
