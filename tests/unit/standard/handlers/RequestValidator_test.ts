import { asserts } from "@/tests/integration/deno/deps.ts";
import { RequestValidator } from "@/src/standard/handlers/RequestValidator.ts";

const testCasesThrow = [
  null,
  undefined,
  {},
  { url: "yep" },
  { method: "yep" },
  { url: true },
  { method: false },
  { url: true, method: true },
  { hello: "yep" },
  true,
  false,
];

Deno.test("RequestValidator", async (t) => {
  for await (const request of testCasesThrow) {
    const testName = typeof request === "object"
      ? JSON.stringify(request)
      : request;

    await t.step(`throws if request is \`${testName}\``, () => {
      const requestValidator = new RequestValidator();
      asserts.assertThrows(() => requestValidator.handle(request));
    });
  }

  await t.step("throws if request is not provided", () => {
    const requestValidator = new RequestValidator();
    asserts.assertThrows(() => requestValidator.handle());
  });

  await t.step("throws if request is not provided", () => {
    const requestValidator = new RequestValidator();
    asserts.assertThrows(() => requestValidator.handle());
  });

  await t.step(
    "does not throw if the object is `{ url: string; method: string }`",
    () => {
      const requestValidator = new RequestValidator();
      try {
        requestValidator.handle({ url: "", method: "" });
        asserts.assert(true); // Asserting just so we assert something in this test
      } catch (e) {
        throw new Error(
          "Request object is valid, but the test failed. Error message: " +
            e.messages,
        );
      }
    },
  );
});
