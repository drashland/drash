import { assertEquals } from "../deps.ts";
import { DrashRequest } from "../../../../src/core/http/drash_request.ts";
import { ErrorHandler, Errors, Types } from "../../../../mod.deno.ts";
import { ErrorHandlerProxy } from "../../../../src/core/proxies/error_handler_proxy.ts";

Deno.test("ErrorHandlerProxy", async (t) => {
  await t.step("handle()", async (t) => {
    await t.step("sets context.error to HTTP 500 as default", async () => {
      const errorHandlerProxy = new ErrorHandlerProxy(ErrorHandler);

      const context: Types.ContextForRequest = {
        request: new DrashRequest(new Request("http://localhost:1997")),
        response: new Response(),
      };

      const response = await errorHandlerProxy.handle(context);

      assertEquals(response.status, 500);
      assertEquals(response.statusText, "Internal Server Error");
      assertEquals(context.error, new HTTPError(500));
    });

    await t.step("uses context.error if it exists", async () => {
      const errorHandlerProxy = new ErrorHandlerProxy(ErrorHandler);

      const context: Types.ContextForRequest = {
        request: new DrashRequest(new Request("http://localhost:1997")),
        response: new Response(),
        error: new HTTPError(400),
      };

      const response = await errorHandlerProxy.handle(context);

      assertEquals(response.status, 400);
      assertEquals(response.statusText, "Bad Request");
      assertEquals(context.error, new HTTPError(400));
    });
  });
});
