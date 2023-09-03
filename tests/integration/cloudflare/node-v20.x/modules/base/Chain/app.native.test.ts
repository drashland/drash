/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023  Drash authors. The Drash authors are listed in the
 * AUTHORS file at <https://github.com/drashland/drash/AUTHORS>. This notice
 * applies to Drash version 3.X.X and any later version.
 *
 * This file is part of Drash. See <https://github.com/drashland/drash>.
 *
 * Drash is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * Drash is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Drash. If not, see <https://www.gnu.org/licenses/>.
 */

import { lstatSync } from "fs";
import { unstable_dev } from "wrangler";
import type { UnstableDevWorker } from "wrangler";

const testName =
  "tests/integration/cloudflare/node-v18.x/modules/base/Chain/app.native.ts";

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
