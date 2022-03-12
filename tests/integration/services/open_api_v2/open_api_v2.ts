import * as Drash from "../../../../mod.ts";
import { OpenAPIV2Service } from "../../../../src/services/open_api/v2/open_api.ts";
import { asserts, plan, run, suite, test } from "../../../deps.ts";
const { assertEquals } = asserts;

const oas = new OpenAPIV2Service();
import { builders } from "../../../../src/services/open_api/v2/open_api.ts";
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
  buildSpec: build,
} = builders;

plan("Open API v2 Service", () => {
  suite("string()", () => {
    test("basic", () => {
      assertEquals(
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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
        build({
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

  suite("pathItem()", () => {
    test("sets GET", () => {
      assertEquals(
        build(
          pathItem().get(operation()),
        ),
        {
          get: {},
        },
      );
    });
  });

  suite("parameters.path()", () => {
    test("sets name, in, required", () => {
      assertEquals(
        build(
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
        build(
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
        build(
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
        build(
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
        build(
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
        build(
          operation().parameters([
            parameters.query().name("test"),
          ]),
        ),
        {
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
        build(swagger({
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
        build(swagger({
          info: {
            title: "My API",
            version: "v1.0.1",
          },
          paths: {
            "/some-path": pathItem()
              .get(
                operation()
                  .responses({
                    200: response().description("Test GET"),
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
