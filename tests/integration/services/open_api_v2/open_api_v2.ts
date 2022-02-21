import * as Drash from '../../../../mod.ts';
import { OpenAPIV2Service } from '../../../../src/services/open_api/v2/open_api.ts';
import { Rhum } from '../../../deps.ts';

const oas = new OpenAPIV2Service();

Rhum.testPlan("Open API v2 Service", () => {

  Rhum.testSuite("string()", () => {
    Rhum.testCase("basic", () => {
      Rhum.asserts.assertEquals(
        {
          hello: oas.string().toJson(),
        },
        {
          hello: {
            type: "string",
          }
        }
      );
    });

    Rhum.testCase("format()", () => {
      Rhum.asserts.assertEquals(
        {
          hello: oas.string().format("email").toJson(),
        },
        {
          hello: {
            type: "string",
            format: "email"
          }
        }
      )

      Rhum.asserts.assertEquals(
        {
          hello: oas.string().format("password").toJson(),
        },
        {
          hello: {
            type: "string",
            format: "password"
          }
        }
      )
    });

    Rhum.testCase("ref()", () => {
      Rhum.asserts.assertEquals(
        {
          hello: oas.string().ref("Password").toJson(),
        },
        {
          hello: {
            $ref: "#/definitions/Password",
          }
        }
      )
    });
  });

  Rhum.testSuite("schema(): object", () => {
    Rhum.testCase("basic", () => {
      Rhum.asserts.assertEquals(
        {
          SomeModel: oas.object().toJson(),
        },
        {
          SomeModel: {
            type: "object",
          }
        }
      );
    });

    Rhum.testCase("properties()", () => {
      Rhum.asserts.assertEquals(
        {
          SomeModel: oas.object().properties({
            name: oas.string().required(),
          }).toJson(),
        },
        {
          SomeModel: {
            type: "object",
            required: [
              "name"
            ],
            properties: {
              name: {
                type: "string"
              }
            }
          }
        }
      )
    });

    Rhum.testCase("properties() with object schema object", () => {
      Rhum.asserts.assertEquals(
        {
          SomeModel: oas.object().properties({
            name: oas.string().format("something").required(),
            some_object: oas.object().properties({
              nested_name: oas.string(),
            }).required(),
          }).toJson(),
        },
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
                  }
                },
              }
            }
          }
        }
      )
    });

    Rhum.testCase("ref()", () => {
      Rhum.asserts.assertEquals(
        {
          SomeModel: oas.object().ref(
            "SomeOtherModel"
          ).toJson(),
        },
        {
          SomeModel: {
            $ref: "#/definitions/SomeOtherModel",
          }
        }
      )
    });
  });

  Rhum.testSuite("schema(): array", () => {
    Rhum.testCase("basic", () => {
      Rhum.asserts.assertEquals(
        {
          SomeModel: oas.array().items(
            oas.string()
          ).toJson(),
        },
        {
          SomeModel: {
            type: "array",
            items: {
              type: "string",
            }
          }
        }
      );
    });

    Rhum.testCase("items()", () => {
      Rhum.asserts.assertEquals(
        {
          SomeModel: oas.array().items(
            oas.string().required(),
          ).toJson(),
        },
        {
          SomeModel: {
            type: "array",
            items: {
              type: "string"
            }
          }
        }
      )
    });

    Rhum.testCase("items() with array schema object", () => {
      Rhum.asserts.assertEquals(
        {
          SomeModel: oas.array().items(
            oas.array().items(
              oas.string()
            )
          ).toJson(),
        },
        {
          SomeModel: {
            type: "array",
            items: {
              type: "array",
              items: {
                type: "string",
              },
            },
          }
        }
      )
    });

    Rhum.testCase("ref()", () => {
      Rhum.asserts.assertEquals(
        {
          SomeModel: oas.array().ref(
            "SomeOtherModel"
          ).toJson(),
        },
        {
          SomeModel: {
            $ref: "#/definitions/SomeOtherModel",
          }
        }
      )
    });
  });
});

Rhum.run();
