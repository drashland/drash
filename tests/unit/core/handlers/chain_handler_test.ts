import { assertEquals } from "https://deno.land/std@0.147.0/testing/asserts.ts";
import { ChainHandler } from "../../../../src/core/handlers/chain_handler.ts";
import { DrashRequest } from "../../../../src/deno/http/drash_request.ts";
import { ResponseBuilder } from "../../../../src/core/http/response_builder.ts";
import { Types } from "../../../../mod.deno.ts";

Deno.test("ChainHandler", async (t) => {
  await t.step("handle()", async (t) => {
    await t.step("can handle a chain of given methods", async () => {
      class MyChainHandler extends ChainHandler {
        #method_chain: Types.HandleMethod<Types.ContextForRequest, void>[] = [];

        constructor() {
          super();

          this.#method_chain.push((context: Types.ContextForRequest) => {
            context.response.text("Hello! This is a text response!");
          });

          this.#method_chain.push((context: Types.ContextForRequest) => {
            context.request.headers.append("X-HELLO", "GOODBYE!");
          });
        }

        public handle(
          context: Types.ContextForRequest,
        ): Types.Promisable<boolean> {
          return Promise
            .resolve()
            .then(() => this.runMethodChain(context, this.#method_chain))
            .then(() => true);
        }
      }

      const myChainHandler = new MyChainHandler();

      const context = {
        request: new DrashRequest(
          new Request("http://localhost:1337/my-cool-url"),
        ),
        response: new ResponseBuilder(),
      };

      const result = await myChainHandler.handle(context);

      assertEquals(
        result,
        true,
      );

      assertEquals(
        context.request.headers.get("X-HELLO"),
        "GOODBYE!",
      );

      assertEquals(
        await (context.response.build()).text(),
        "Hello! This is a text response!",
      );
    });
  });
});
