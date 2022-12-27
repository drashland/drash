import { assertEquals } from "../deps.ts";
import { Resource } from "../../../../src/core/http/resource.ts";
import { DrashRequest } from "../../../../src/core/http/drash_request.ts";
import { HTTPError } from "../../../../src/core/http/errors.ts";
import { Method } from "../../../../src/core/Enums.ts";
import * as Types from "../../../../src/core/types.ts";

const request = new DrashRequest(new Request("http://localhost:1997"));

Deno.test("Resource", async (t) => {
  await t.step(`CONNECT()`, async (t) => {
    await t.step("defaults to HTTP 501", async () => {
      const context: Types.ContextForRequest = {
        request,
      };

      const resource = new Resource();

      const response = await resource.CONNECT(
        context.request,
      );

      assertEquals(
        await response.text(),
        "Not Implemented",
      );
    });
  });

  await t.step(`DELETE()`, async (t) => {
    await t.step("defaults to HTTP 501", async () => {
      const context: Types.ContextForRequest = {
        request,
      };

      const resource = new Resource();

      const response = await resource.DELETE(
        context.request,
      );

      assertEquals(
        await response.text(),
        "Not Implemented",
      );
    });
  });

  // await t.step(`GET()`, async (t) => {
  //   await t.step("defaults to HTTP 501", async () => {
  //     const context: Types.ContextForRequest = {
  //       request,
  //     };

  //     const resource = new Resource();

  //     const response = await resource.GET(
  //       context.request,
  //     );

  //     assertEquals(
  //       await response.text(),
  //       "Not Implemented",
  //     );
  //   });
  // });

  // await t.step(`HEAD()`, async (t) => {
  //   await t.step("defaults to HTTP 501", async () => {
  //     const context: Types.ContextForRequest = {
  //       request,
  //     };

  //     const resource = new Resource();

  //     const response = await resource.HEAD(
  //       context.request,
  //     );

  //     assertEquals(
  //       await response.text(),
  //       "Not Implemented",
  //     );
  //   });
  // });

  // await t.step(`OPTIONS()`, async (t) => {
  //   await t.step("defaults to HTTP 501", async () => {
  //     const context: Types.ContextForRequest = {
  //       request,
  //     };

  //     const resource = new Resource();

  //     const response = await resource.OPTIONS(
  //       context.request,
  //     );

  //     assertEquals(
  //       await response.text(),
  //       "Not Implemented",
  //     );
  //   });
  // });
});
