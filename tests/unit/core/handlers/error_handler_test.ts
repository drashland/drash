import { assertEquals } from "../deps.ts";
import { DrashRequest } from "../../../../src/core/http/drash_request.ts";
import { ErrorHandler } from "../../../../src/core/handlers/error_handler.ts";
import * as Errors from "../../../../src/core/http/errors.ts";

function request() {
  const req = new Request("https://drash.land", {
    headers: {
      Accept: "application/json;text/html",
    },
  });

  return new DrashRequest(
    req,
  );
}

class ErrorWithRandomCodeNumber extends Error {
  public code: number;
  constructor(code: number, message?: string) {
    super(message ?? "(no error message provided)");
    this.code = code;
  }
}

class ErrorWithRandomCodeString extends Error {
  public code: string;
  constructor(code: string, message?: string) {
    super(message ?? "(no error message provided)");
    this.code = code;
  }
}

const errorHandler = new ErrorHandler();

Deno.test("catch()", async (t) => {
  await t.step("new Error()", async () => {
    const context = {
      error: new Error(),
      request: request(),
    };
    const response = await errorHandler.handle(context);
    assertEquals(response.status, 500);
  });

  await t.step("Built-in JS Errors", () => {
    const errors = [
      new EvalError(),
      new RangeError(),
      new ReferenceError(),
      new SyntaxError(),
      new TypeError(),
      new URIError(),
    ];

    errors.forEach(async (_error: Error) => {
      const context = {
        error: new Error(),
        request: request(),
      };
      const response = await errorHandler.handle(context);
      assertEquals(response.status, 500);
    });
  });

  await t.step("{ code: 'Hello' }", async () => {
    const context = {
      error: new ErrorWithRandomCodeString("Hello"),
      request: request(),
    };
    const response = await errorHandler.handle(context);
    assertEquals(response.status, 500);
  });

  await t.step("{ code: '500' }", async () => {
    const context = {
      error: new ErrorWithRandomCodeString("SQL15023"),
      request: request(),
    };
    const response = await errorHandler.handle(context);
    assertEquals(response.status, 500);
  });

  await t.step("{ code: 400 }", async () => {
    const context = {
      error: new ErrorWithRandomCodeNumber(400),
      request: request(),
    };
    const response = await errorHandler.handle(context);
    assertEquals(response.status, 400);
  });

  await t.step("new Drash.HTTPError(401)", async () => {
    const context = {
      error: new HTTPError(401),
      request: request(),
    };
    const response = await errorHandler.handle(context);
    assertEquals(response.status, 401);
  });
});
