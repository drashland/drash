import { assertEquals } from "../deps.ts";
import { DrashRequest } from "../../../../src/deno/http/drash_request.ts";
import { ResponseBuilder } from "../../../../src/core/http/response_builder.ts";
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
    const res = new ResponseBuilder();
    const context = {
      error: new Error(),
      response: res,
      request: request(),
    };
    errorHandler.handle(context);
    const nativeRes = await res.toNativeResponse();
    assertEquals(nativeRes.status, 500);
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
      const res = new ResponseBuilder();
      const context = {
        error: new Error(),
        response: res,
        request: request(),
      };
      errorHandler.handle(context);
      const nativeRes = await res.toNativeResponse();
      assertEquals(nativeRes.status, 500);
    });
  });

  await t.step("{ code: 'Hello' }", async () => {
    const res = new ResponseBuilder();
    const context = {
      error: new ErrorWithRandomCodeString("Hello"),
      response: res,
      request: request(),
    };
    errorHandler.handle(context);
    const nativeRes = await res.toNativeResponse();
    assertEquals(nativeRes.status, 500);
  });

  await t.step("{ code: '500' }", async () => {
    const res = new ResponseBuilder();
    const context = {
      error: new ErrorWithRandomCodeString("SQL15023"),
      response: res,
      request: request(),
    };
    errorHandler.handle(context);
    const nativeRes = await res.toNativeResponse();
    assertEquals(nativeRes.status, 500);
  });

  await t.step("{ code: 400 }", async () => {
    const res = new ResponseBuilder();
    const context = {
      error: new ErrorWithRandomCodeNumber(400),
      response: res,
      request: request(),
    };
    errorHandler.handle(context);
    const nativeRes = await res.toNativeResponse();
    assertEquals(nativeRes.status, 400);
  });

  await t.step("new Drash.Errors.HttpError(401)", async () => {
    const res = new ResponseBuilder();
    const context = {
      error: new Errors.HttpError(401),
      response: res,
      request: request(),
    };
    errorHandler.handle(context);
    const nativeRes = await res.toNativeResponse();
    assertEquals(nativeRes.status, 401);
  });
});
