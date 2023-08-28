import { asserts } from "../../../deps.ts";
import { RequestValidator } from "../../../../src/standard/handlers/RequestValidator.ts";

const testCasesThrow = [
  {
    input: null,
    expected: "Request could not be read",
  },
  {
    input: undefined,
    expected: "Request could not be read",
  },
  {
    input: {},
    expected: "Request HTTP method could not be read",
  },
  {
    input: { url: "yep" },
    expected: "Request HTTP method could not be read",
  },
  {
    input: { method: "yep" },
    expected: "Request URL could not be read",
  },
  {
    input: { url: true },
    expected: "Request HTTP method could not be read",
  },
  {
    input: { method: false },
    expected: "Request HTTP method could not be read",
  },
  {
    input: { url: true, method: true },
    expected: "Request HTTP method could not be read",
  },
  {
    input: { hello: "yep" },
    expected: "Request HTTP method could not be read",
  },
  {
    input: true,
    expected: "Request could not be read",
  },
  {
    input: false,
    expected: "Request could not be read",
  },
];

Deno.test("RequestValidator", async (t) => {
  for await (const request of testCasesThrow) {
    const testName = JSON.stringify(request);

    await t.step(`throws if request is \`${testName}\``, async () => {
      const requestValidator = new RequestValidator();
      try {
        // @ts-ignore: Igorning because we want to test passing in incorrect
        // values
        await requestValidator.handle(request.input);
      } catch (e) {
        asserts.assertEquals(e.message, request.expected);
      }
    });
  }

  await t.step("throws if request is not provided", async () => {
    const requestValidator = new RequestValidator();
    try {
      // @ts-ignore: Ignorning because we want to test not passing in an arg for
    // cases where TypeScript is not being used
      await requestValidator.handle();
    } catch (e) {
      asserts.assertEquals(e.message, "Request could not be read");
    }
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
