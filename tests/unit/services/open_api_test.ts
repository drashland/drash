import { OpenAPIService } from "../../../src/services/open_api/spec_v2/open_api.ts";
import { assertEquals } from "../../deps.ts";

const oas = new OpenAPIService();

Deno.test("array of strings", () => {
  const actual = oas.array()
    .items(oas.string())
    .toJson();

  assertEquals(actual, {
    type: "array",
    items: {
      type: "string",
    },
  });
});

Deno.test("array of booleans", () => {
  const actual = oas.array()
    .items(oas.boolean())
    .toJson();

  assertEquals(actual, {
    type: "array",
    items: {
      type: "boolean",
    },
  });
});

Deno.test("array min max", () => {
  const actual = oas.array()
    .items(oas.boolean())
    .toJson();

  assertEquals(actual, {
    type: "array",
    items: {
      type: "boolean",
    },
  });
});
