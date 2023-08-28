import { lstatSync } from "fs";
import { unstable_dev } from "wrangler";
import type { UnstableDevWorker } from "wrangler";

const testName =
  "tests/integration/cloudflare/node-v18.x/modules/base/Chain/app.polyfill.ts";

lstatSync(testName);

describe("Wrangler", () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev(testName, {
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it("Should return Hello World", async () => {
    const res = await worker.fetch("/");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello from GET.");
  });
});
