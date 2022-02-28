import * as Drash from "../../../../mod.ts";
import { OpenAPIService } from "../../../../src/services/open_api/v2/open_api.ts";
import { IBuilder } from "../../../../src/services/open_api/v2/interfaces.ts";
import { asserts, plan, run, suite, test } from "../../../deps.ts";
import { PathItemObjectBuilder } from "../../../../src/services/open_api/v2/builders/path_item_object_builder.ts";
const { assertEquals } = asserts;

import { buildSpec, builders } from "../../../../src/services/open_api/v2/open_api.ts";

const {
  array,
  integer,
  object,
  string,
  swagger,
  pathItem,
  operation,
  response,
  parameters,
} = builders;

plan("Open API v2 Service", () => {
  suite("string()", () => {
    test("basic", () => {
      assertEquals(
        buildSpec({
          hello: string(),
        }),
        {
          hello: {
            type: "string",
          },
        },
      );
    });

    test("format()", () => {
      assertEquals(
        buildSpec({
          hello: string().format("email"),
        }),
        {
          hello: {
            type: "string",
            format: "email",
          },
        },
      );

      assertEquals(
        buildSpec({
          hello: string().format("password"),
        }),
        {
          hello: {
            type: "string",
            format: "password",
          },
        },
      );
    });

    test("ref()", () => {
      assertEquals(
        buildSpec({
          hello: string().ref("Password"),
        }),
        {
          hello: {
            $ref: "#/definitions/Password",
          },
        },
      );
    });
  });

  suite("integer()", () => {
    test("basic", () => {
      assertEquals(
        buildSpec({
          hello: integer(),
        }),
        {
          hello: {
            type: "integer",
            format: "int32",
          },
        },
      );
    });

    test("format()", () => {
      assertEquals(
        buildSpec({
          hello: integer().format("int64"),
        }),
        {
          hello: {
            type: "integer",
            format: "int64",
          },
        },
      );
    });

    test("ref()", () => {
      assertEquals(
        buildSpec({
          hello: string().ref("Password"),
        }),
        {
          hello: {
            $ref: "#/definitions/Password",
          },
        },
      );
    });
  });

  suite("schema(): object", () => {
    test("basic", () => {
      assertEquals(
        buildSpec({
          SomeModel: object(),
        }),
        {
          SomeModel: {
            type: "object",
          },
        },
      );
    });

    test("properties()", () => {
      assertEquals(
        buildSpec({
          SomeModel: object().properties({
            name: string().required(),
          }),
        }),
        {
          SomeModel: {
            type: "object",
            required: [
              "name",
            ],
            properties: {
              name: {
                type: "string",
              },
            },
          },
        },
      );
    });

    test("properties() with object schema object", () => {
      assertEquals(
        buildSpec({
          SomeModel: object().properties({
            name: string().format("something").required(),
            some_object: object().properties({
              nested_name: string(),
            }).required(),
          }),
        }),
        {
          SomeModel: {
            type: "object",
            required: [
              "name",
              "some_object",
            ],
            properties: {
              name: {
                type: "string",
                format: "something",
              },
              some_object: {
                type: "object",
                properties: {
                  nested_name: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      );
    });

    test("ref()", () => {
      assertEquals(
        buildSpec({
          SomeModel: object().ref(
            "SomeOtherModel",
          ),
        }),
        {
          SomeModel: {
            $ref: "#/definitions/SomeOtherModel",
          },
        },
      );
    });
  });

  suite("schema(): object shorthand", () => {
    test("basic", () => {
      assertEquals(
        buildSpec({
          SomeModel: object(),
        }),
        {
          SomeModel: {
            type: "object",
          },
        },
      );
    });

    test("properties()", () => {
      assertEquals(
        buildSpec({
          SomeModel: object({
            name: string().required(),
          }),
        }),
        {
          SomeModel: {
            type: "object",
            required: [
              "name",
            ],
            properties: {
              name: {
                type: "string",
              },
            },
          },
        },
      );
    });

    test("properties() with object schema object", () => {
      assertEquals(
        buildSpec({
          SomeModel: object({
            name: string().format("something").required(),
            some_object: object({
              nested_name: string(),
            }).required(),
          }),
        }),
        {
          SomeModel: {
            type: "object",
            required: [
              "name",
              "some_object",
            ],
            properties: {
              name: {
                type: "string",
                format: "something",
              },
              some_object: {
                type: "object",
                properties: {
                  nested_name: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      );
    });

    test("ref()", () => {
      assertEquals(
        buildSpec({
          SomeModel: object().ref(
            "SomeOtherModel",
          ),
        }),
        {
          SomeModel: {
            $ref: "#/definitions/SomeOtherModel",
          },
        },
      );
    });
  });

  suite("schema(): array", () => {
    test("basic", () => {
      assertEquals(
        buildSpec({
          SomeModel: array().items(
            string(),
          ),
        }),
        {
          SomeModel: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      );
    });

    test("items()", () => {
      assertEquals(
        buildSpec({
          SomeModel: array().items(
            string().required(),
          ),
        }),
        {
          SomeModel: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      );
    });

    test("items() with array schema object", () => {
      assertEquals(
        buildSpec({
          SomeModel: array().items(
            array().items(
              string(),
            ),
          ),
        }),
        {
          SomeModel: {
            type: "array",
            items: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
      );
    });

    test("ref()", () => {
      assertEquals(
        buildSpec({
          SomeModel: array().ref(
            "SomeOtherModel",
          ),
        }),
        {
          SomeModel: {
            $ref: "#/definitions/SomeOtherModel",
          },
        },
      );
    });
  });

  suite("schema(): array shorthand", () => {
    test("basic", () => {
      assertEquals(
        buildSpec({
          SomeModel: array(
            string(),
          ),
        }),
        {
          SomeModel: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      );
    });

    test("items()", () => {
      assertEquals(
        buildSpec({
          SomeModel: array(
            string().required(),
          ),
        }),
        {
          SomeModel: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      );
    });

    test("items() with array schema object", () => {
      assertEquals(
        buildSpec({
          SomeModel: array(
            array().items(
              string(),
            ),
          ),
        }),
        {
          SomeModel: {
            type: "array",
            items: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
      );
    });

    test("ref()", () => {
      assertEquals(
        buildSpec({
          SomeModel: array().ref(
            "SomeOtherModel",
          ),
        }),
        {
          SomeModel: {
            $ref: "#/definitions/SomeOtherModel",
          },
        },
      );
    });
  });

  suite("pathItem()", () =>
    pathItemTestData().forEach(
      (data: { name: string; builder: IBuilder; expected: unknown }) => {
        test(data.name, () => {
          assertEquals(
            buildSpec(data.builder),
            data.expected,
          );
        });
      },
    ));

  suite("parameters.path()", () => {
    test("sets name, in, required", () => {
      assertEquals(
        buildSpec(
          parameters.path().name("test"),
        ),
        {
          name: "test",
          in: "path",
          required: true,
        },
      );
    });
  });

  suite("parameters.body()", () => {
    test("sets name, in, schema", () => {
      assertEquals(
        buildSpec(
          parameters.body()
            .name("test")
            .schema(
              object().properties({
                hello: string(),
                world: string().required(),
              }),
            ),
        ),
        {
          name: "test",
          in: "body",
          schema: {
            type: "object",
            required: [
              "world",
            ],
            properties: {
              hello: {
                type: "string",
              },
              world: {
                type: "string",
              },
            },
          },
        },
      );
    });
    test("sets name, in, schema, description", () => {
      assertEquals(
        buildSpec(
          parameters.body()
            .name("test")
            .description("Some body")
            .schema(array().items(string())),
        ),
        {
          name: "test",
          in: "body",
          description: "Some body",
          schema: {
            items: {
              type: "string",
            },
            type: "array",
          },
        },
      );
    });
  });

  suite("parameters.query()", () => {
    test("sets name, in", () => {
      assertEquals(
        buildSpec(
          parameters.query().name("test"),
        ),
        {
          name: "test",
          in: "query",
        },
      );
    });
    test("sets name, in, description", () => {
      assertEquals(
        buildSpec(
          parameters.query().name("test").description("Some query param"),
        ),
        {
          name: "test",
          in: "query",
          description: "Some query param",
        },
      );
    });
  });

  suite("operation()", () => {
    test("requires .parameters() to take in an array", () => {
      assertEquals(
        buildSpec(
          operation().responses({ 200: response().description("OK") })
            .parameters([
              parameters.query().name("test"),
            ]),
        ),
        {
          responses: { 200: { description: "OK" } },
          parameters: [
            {
              name: "test",
              in: "query",
            },
          ],
        },
      );
    });
  });

  suite("swagger()", () => {
    test("requires info.title, info.version, and paths", () => {
      assertEquals(
        buildSpec(swagger({
          info: {
            title: "My API",
            version: "v1.0.1",
          },
        })),
        {
          swagger: "2.0", // Auto-generated by swagger()
          info: {
            title: "My API",
            version: "v1.0.1",
          },
          paths: {}, // Auto-generated by swagger()
        },
      );
    });

    test("can build paths object", () => {
      assertEquals(
        buildSpec(swagger({
          info: {
            title: "My API",
            version: "v1.0.1",
          },
          paths: {
            "/some-path": pathItem()
              .get(
                operation()
                  .parameters([
                    parameters.path().name("account_id").description(
                      "The ID of the account to get.",
                    ).type(string()),
                    parameters.path().name("user_id").description(
                      "The ID of the user who owns the account.",
                    ).type(string()),
                    parameters.header().name("X-TEST").description(
                      "Some random header. Who knows?",
                    ).type(string()),
                  ])
                  .responses({
                    200: response().description("If you got it!"),
                    400: response().description("If you bad requested it!"),
                    404: response().description("If we no find!"),
                    500: response().description("Daaaaang... got'em!"),
                  }),
              )
              .post(
                operation()
                  .responses({
                    200: "Test POST",
                  }),
              ),
          },
        })),
        {
          swagger: "2.0",
          info: {
            title: "My API",
            version: "v1.0.1",
          },
          paths: {
            "/some-path": {
              get: {
                responses: {
                  200: {
                    description: "Test GET",
                  },
                },
              },
              post: {
                responses: {
                  200: {
                    description: "Test POST",
                  },
                },
              },
            },
          },
        },
      );
    });
  });
});

run();

function pathItemTestData(): any {
  const methods = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "head",
    "options",
  ];

  return [
    ...methods.map((method: string) => {
      return [
        // Basic tests
        {
          name: `${method}: sets empty operation object`,
          // @ts-ignore
          builder: pathItem()[method](
            operation().responses({ 200: response().description("OK") }),
          ),
          expected: {
            [method]: {
              responses: { 200: { description: "OK" } },
            },
          },
        },

        // With $ref
        {
          name: `${method}: sets $ref on property`,
          // @ts-ignore
          builder: {
            "/some-path": pathItem().ref("SomePathItemDefinition"),
          },
          expected: {
            "/some-path": {
              $ref: "#/definitions/SomePathItemDefinition",
            },
          },
        },
        {
          name: `${method}: sets $ref`,
          // @ts-ignore
          builder: pathItem().ref("SomePathItemDefinition"),
          expected: {
            $ref: "#/definitions/SomePathItemDefinition",
          },
        },

        // With query parameters
        {
          name: `${method}: sets query params`,
          // @ts-ignore
          builder: pathItem()[method](
            operation().responses({ 200: response().description("OK") }),
          ).parameters([
            parameters.query().name("hello").type("string"),
            parameters.query().name("world").type("string"),
          ]),
          expected: {
            [method]: {
              responses: { 200: { description: "OK" } },
            },
            parameters: [
              {
                in: "query",
                name: "hello",
              },
              {
                in: "query",
                name: "world",
              },
            ],
          },
        },
        {
          name: `${method}: sets query params on path`,
          builder: {
            // @ts-ignore
            "/some-path": pathItem()[method](
              operation().responses({ 200: response().description("OK") }),
            ).parameters([
              parameters.query().name("hello").type("string"),
              parameters.query().name("world").type("string"),
            ]),
          },
          expected: {
            "/some-path": {
              [method]: {
                responses: { 200: { description: "OK" } },
              },
              parameters: [
                {
                  in: "query",
                  name: "hello",
                },
                {
                  in: "query",
                  name: "world",
                },
              ],
            },
          },
        },

        // With form data
        {
          name: `${method}: sets formData params`,
          // @ts-ignore
          builder: pathItem()[method](
            operation().responses({ 200: response().description("OK") }),
          ).parameters([
            parameters.formData().name("hello").type(string()),
            parameters.formData().name("world").type(string()),
          ]),
          expected: {
            [method]: {
              responses: { 200: { description: "OK" } },
            },
            parameters: [
              {
                in: "formData",
                name: "hello",
              },
              {
                in: "formData",
                name: "world",
              },
            ],
          },
        },

        // With only one body parameter
        {
          name: `${method}: sets body param`,
          // @ts-ignore
          builder: pathItem()[method](
            operation().responses({ 200: response().description("OK") }),
          ).parameters([
            parameters.body().name("body").schema(object()),
          ]),
          expected: {
            [method]: {
              responses: { 200: { description: "OK" } },
            },
            parameters: [
              {
                in: "body",
                name: "body",
                schema: {
                  type: "object",
                },
              },
            ],
          },
        },

        // With only one body parameter required
        {
          name: `${method}: sets body param`,
          // @ts-ignore
          builder: pathItem()[method](
            operation().responses({ 200: response().description("OK") }),
          ).parameters([
            parameters.body().name("body").schema(
              object().properties({
                some_property: string().required(),
              }),
            ).required(),
          ]),
          expected: {
            [method]: {
              responses: { 200: { description: "OK" } },
            },
            parameters: [
              {
                in: "body",
                name: "body",
                schema: {
                  required: [
                    "some_property",
                  ],
                  type: "object",
                  properties: {
                    some_property: {
                      type: "string",
                    },
                  },
                },
                required: true,
              },
            ],
          },
        },

        // With path parameters
        {
          name: `${method}: sets path params`,
          // @ts-ignore
          builder: pathItem()[method](
            operation().responses({
              200: response().description("OK"),
            }),
          ).parameters([
            parameters.path().name("hello"),
            parameters.path().name("world"),
          ]),
          expected: {
            [method]: {
              responses: { 200: { description: "OK" } },
            },
            parameters: [
              {
                in: "path",
                name: "hello",
                required: true,
              },
              {
                in: "path",
                name: "world",
                required: true,
              },
            ],
          },
        },

        // With headers
        {
          name: `${method}: sets header params`,
          // @ts-ignore
          builder: pathItem()[method](
            operation().responses({ 200: response().description("OK") }),
          ).parameters([
            parameters.header().name("hello").type(string()),
            parameters.header().name("world").type(string()),
          ]),
          expected: {
            [method]: {
              responses: { 200: { description: "OK" } },
            },
            parameters: [
              {
                in: "header",
                name: "hello",
              },
              {
                in: "header",
                name: "world",
              },
            ],
          },
        },

        {
          name: `${method}: sets header params required`,
          // @ts-ignore
          builder: pathItem()[method](
            operation().responses({ 200: response().description("OK") }),
          ).parameters([
            parameters.header().name("hello").type(string()),
            parameters.header().name("world").type(string()).required(),
          ]),
          expected: {
            [method]: {
              responses: { 200: { description: "OK" } },
            },
            parameters: [
              {
                in: "header",
                name: "hello",
              },
              {
                in: "header",
                name: "world",
                required: true,
              },
            ],
          },
        },

        {
          name: `${method}: sets header params required`,
          // @ts-ignore
          builder: pathItem()[method](
            operation().responses({ 200: response().description("OK") }),
          ).parameters([
            parameters.header().name("hello").type(string()),
            parameters.header().name("world").type(string()).required(),
          ]),
          expected: {
            [method]: {
              responses: { 200: { description: "OK" } },
            },
            parameters: [
              {
                in: "header",
                name: "hello",
              },
              {
                in: "header",
                name: "world",
                required: true,
              },
            ],
          },
        },
      ];
    }).flat(),
  ];
}
