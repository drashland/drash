import { assertEquals } from "../deps.ts";
import { ResponseBuilder } from "../../../../src/core/http/response_builder.ts";
import { Resource } from "../../../../src/core/http/resource.ts";
import { DrashRequest } from "../../../../src/deno/http/drash_request.ts";
import { Errors, Types } from "../../../../mod.deno.ts";
import { Method as HTTPMethod } from "../../../../src/core/http/status_code_registry.ts";

const request = new DrashRequest(new Request("http://localhost:1997"));

Deno.test("Resource", async (t) => {
  for (const httpMethod in HTTPMethod) {
    await t.step(`${httpMethod}()`, async (t) => {
      await t.step("defaults to HTTP 501", async () => {
        const context = {
          request,
          response: new ResponseBuilder(),
        };
        const resource = new Resource();
        resource[httpMethod as Types.MethodOf<Resource>](
          context.request,
          context.response,
        );
        assertEquals(
          await context.response.error_init,
          new Errors.HttpError(501),
        );
      });
    });
  }
});
