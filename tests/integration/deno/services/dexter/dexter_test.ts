import { assertEquals } from "../../deps.ts";
import { DexterService } from "../../../../../services/deno/dexter/dexter.ts";

Deno.test("Dexter - mod_test.ts", async (t) => {
  await t.step("Dexter", async (t) => {
    await t.step("is configurable", () => {
      let dexter = new DexterService();
      assertEquals(dexter.configs.enabled, true);
      dexter = new DexterService({
        enabled: false,
      });
      assertEquals(dexter.configs.enabled, false);
    });
    await t.step(
      "logger and all of its log functions are exposed",
      () => {
        const dexter = new DexterService({
          enabled: true,
        });
        assertEquals(typeof dexter.logger.debug, "function");
        assertEquals(typeof dexter.logger.error, "function");
        assertEquals(typeof dexter.logger.fatal, "function");
        assertEquals(typeof dexter.logger.info, "function");
        assertEquals(typeof dexter.logger.trace, "function");
        assertEquals(typeof dexter.logger.warn, "function");
      },
    );
    await t.step("logger can be used to write messages", () => {
      const dexter = new DexterService({
        enabled: true,
      });
      let actual;
      actual = dexter.logger.debug("test") as string;
      assertEquals(
        actual.match(
          /.*\[DEBUG\].*\s\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d \| test/,
        )?.length,
        1,
      );
      actual = dexter.logger.error("test") as string;
      assertEquals(
        actual.match(
          /.*\[ERROR\].*\s\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d \| test/,
        )?.length,
        1,
      );
      actual = dexter.logger.fatal("test") as string;
      assertEquals(
        actual.match(
          /.*\[FATAL\].*\s\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d \| test/,
        )?.length,
        1,
      );
      actual = dexter.logger.info("test") as string;
      assertEquals(
        actual.match(
          /.*\[INFO\].*\s\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d \| test/,
        )?.length,
        1,
      );
      actual = dexter.logger.trace("test") as string;
      assertEquals(
        actual.match(
          /.*\[TRACE\].*\s\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d \| test/,
        )?.length,
        1,
      );
      actual = dexter.logger.warn("test") as string;
      assertEquals(
        actual.match(
          /.*\[WARN\].*\s\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d \| test/,
        )?.length,
        1,
      );
    });
  });
});
