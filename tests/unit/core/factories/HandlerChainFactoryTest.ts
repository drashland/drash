import { ResponseBuilder } from "../../../../src/builders/ResponseBuilder.ts";
import { createRequestChainOfResponsibility } from "../../../../src/core/factories/ChainOfResponsibilityFactory.ts";
import { ChainOfResponsibilityHandler } from "../../../../src/core/handlers/ChainOfResponsibilityHandler.ts";
import * as Types from "../../../../src/core/Types.ts";
import * as Interfaces from "../../../../src/core/Interfaces.ts";
import { assertEquals } from "../deps.ts";

class HandlerA extends ChainOfResponsibilityHandler {
  handle(
    context: Types.ContextForRequest,
  ): Types.Promisable<Types.ContextForRequest> {
    const { request, response } = context;

    // This header should persist in the response
    const requestHeaderValue = request.headers.get("x-forwarded-by") ??
      'If you are seeing this, then this test is broken. This value should be "bees" in the response.';
    response.headers({
      "x-request-x-forwarded-by": requestHeaderValue,
    });

    const h = response.state.headers?.get("x-handled-by") ?? "";
    context.response.headers({
      "x-handled-by": (h + `${this.constructor.name};`),
    });
    return super.handle(context);
  }
}

class HandlerB extends ChainOfResponsibilityHandler {
  handle(
    context: Types.ContextForRequest,
  ): Types.Promisable<Types.ContextForRequest> {
    const { response } = context;
    const h = response.state.headers?.get("x-handled-by") ?? "";
    context.response.headers({
      "x-handled-by": (h + `${this.constructor.name};`),
    });

    // This body should persist in the response
    response.body("Hello from HandlerB!");

    return super.handle(context);
  }
}

class HandlerC extends ChainOfResponsibilityHandler {
  handle(
    context: Types.ContextForRequest,
  ): Types.Promisable<Types.ContextForRequest> {
    const { response } = context;
    const h = response.state.headers?.get("x-handled-by") ?? "";
    context.response.headers({
      "x-handled-by": (h + `${this.constructor.name};`),
    });
    return super.handle(context);
  }
}

class HandlerD extends ChainOfResponsibilityHandler {
  handle(
    context: Types.ContextForRequest,
  ): Types.Promisable<Types.ContextForRequest> {
    const { response } = context;
    const h = response.state.headers?.get("x-handled-by") ?? "";
    context.response.headers({
      "x-handled-by": (h + `${this.constructor.name};`),
    });
    return super.handle(context);
  }
}

class HandlerE extends ChainOfResponsibilityHandler {
  handle(
    context: Types.ContextForRequest,
  ): Types.Promisable<Types.ContextForRequest> {
    const { response } = context;
    const h = response.state.headers?.get("x-handled-by") ?? "";
    context.response.headers({
      "x-handled-by": (h + `${this.constructor.name};`),
    });
    return super.handle(context);
  }
}

Deno.test("HandlerChainFactory", async (t) => {
  await t.step("createHandlerChain()", async () => {
    const handlers: Interfaces.RequestHandler[] = [
      new HandlerA(),
      new HandlerB(),
      new HandlerC(),
      new HandlerD(),
      new HandlerE(),
    ];

    // Concatenate the handlers so they can call each other in sequential order
    const handlerA = createRequestChainOfResponsibility(
      handlers,
    );

    const request = new Request("http://localhost:1337", {
      headers: {
        "x-forwarded-by": "bees",
      },
    });

    const response = new ResponseBuilder();

    const context = {
      request,
      response,
    };

    // Calling this should continuously call all handlers in the chain. We
    // expect HandlerA, HandlerB, HandlerC, HandlerD, and HandlerE to handle
    // the `context` variable above.
    handlerA.handle(context);

    const nativeResponse = context.response.build();

    assertEquals(
      nativeResponse.headers.get("x-handled-by"),
      "HandlerA;HandlerB;HandlerC;HandlerD;HandlerE;",
    );

    assertEquals(
      nativeResponse.headers.get("x-request-x-forwarded-by"),
      "bees",
    );

    assertEquals(
      await nativeResponse.text(),
      "Hello from HandlerB!",
    );
  });
});
