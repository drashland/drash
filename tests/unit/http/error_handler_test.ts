import * as Drash from "../../../mod.ts";
import type { ConnInfo } from "../../../deps.ts";
import { assertEquals } from "../../deps.ts";

const connInfo: ConnInfo = {
  localAddr: {
    transport: "tcp",
    hostname: "localhost",
    port: 1337,
  },
  remoteAddr: {
    transport: "udp",
    hostname: "localhost",
    port: 1337,
  },
};

function request() {
  const req = new Request("https://drash.land", {
    headers: {
      Accept: "application/json;text/html",
    },
  });

  return new Drash.Request(
    req,
    new Map(),
    connInfo,
  );
}

const errorHandler = new Drash.ErrorHandler();

Deno.test("unit/http/error_handler_test.ts | catch() | new Error()", () => {
  const res = new Drash.Response();
  errorHandler.catch(
    new Error(),
    request(),
    res,
  );
  assertEquals(res.status, 500);
});

Deno.test("unit/http/error_handler_test.ts | catch() | Built-in JS Errors", () => {
  const errors = [
    new EvalError(),
    new RangeError(),
    new ReferenceError(),
    new SyntaxError(),
    new TypeError(),
    new URIError(),
  ];

  errors.forEach((error: Error) => {
    const res = new Drash.Response();
    errorHandler.catch(
      error,
      request(),
      res,
    );
    assertEquals(res.status, 500);
  });
});

Deno.test("unit/http/error_handler_test.ts | catch() | { code: 'Hello' }", () => {
  const res = new Drash.Response();
  errorHandler.catch(
    new ErrorWithRandomCodeString("Hello"),
    request(),
    res,
  );
  assertEquals(res.status, 500);
});

Deno.test("unit/http/error_handler_test.ts | catch() | { code: '500' }", () => {
  const res = new Drash.Response();
  errorHandler.catch(
    new ErrorWithRandomCodeString("SQL15023"),
    request(),
    res,
  );
  assertEquals(res.status, 500);
});

Deno.test("unit/http/error_handler_test.ts | catch() | { code: 400 }", () => {
  const res = new Drash.Response();
  errorHandler.catch(
    new ErrorWithRandomCodeNumber(400),
    request(),
    res,
  );
  assertEquals(res.status, 400);
});

Deno.test("unit/http/error_handler_test.ts | catch() | new Drash.Errors.HttpError(401)", () => {
  const res = new Drash.Response();
  errorHandler.catch(
    new Drash.Errors.HttpError(401),
    request(),
    res,
  );
  assertEquals(res.status, 401);
});

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
