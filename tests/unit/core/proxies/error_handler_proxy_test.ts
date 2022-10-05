import { assertEquals } from "../deps.ts";
import { NativeRequest } from "../../../../src/deno/http/request.ts";
import { ResponseBuilder } from "../../../../src/core/http/response_builder.ts";
import { ErrorHandler, Errors, Types } from "../../../../mod.deno.ts";
import { ErrorHandlerProxy } from "../../../../src/core/proxies/error_handler_proxy.ts";

Deno.test("ErrorHandlerProxy", async (t) => {
  await t.step("handle()", async (t) => {
    await t.step("sets context.error to HTTP 500 as default", () => {
      const errorHandlerProxy = new ErrorHandlerProxy(ErrorHandler);

      const context: Types.ContextForRequest = {
        request: new NativeRequest(new Request("http://localhost:1997")),
        response: new ResponseBuilder(),
      };

      errorHandlerProxy.handle(context);

      const response = (context.response as ResponseBuilder).build();

      assertEquals(response.status, 500);
      assertEquals(response.statusText, "Internal Server Error");
      assertEquals(context.error, new Errors.HttpError(500));
    });

    await t.step("uses context.error if it exists", () => {
      const errorHandlerProxy = new ErrorHandlerProxy(ErrorHandler);

      const context: Types.ContextForRequest = {
        request: new NativeRequest(new Request("http://localhost:1997")),
        response: new ResponseBuilder(),
        error: new Errors.HttpError(400),
      };

      errorHandlerProxy.handle(context);

      const response = (context.response as ResponseBuilder).build();

      assertEquals(response.status, 400);
      assertEquals(response.statusText, "Bad Request");
      assertEquals(context.error, new Errors.HttpError(400));
    });
  });
});
