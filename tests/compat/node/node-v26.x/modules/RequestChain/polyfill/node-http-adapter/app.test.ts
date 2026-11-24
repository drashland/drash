/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023-2026  Drash authors. The Drash authors are listed in the
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

import type { Server } from "node:http";

import { encode } from "../../../../../../../../dist/modules/middleware/x402/Encoding";
import { accepts, start } from "./app";

describe("Polyfill - node:http through toWebRequest/writeWebResponse", () => {
  let server: Server;
  let origin: string;

  beforeAll(async () => {
    ({ server, origin } = await start());
  });

  afterAll(() => {
    return new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("passes the URL, headers, and body in, and status and cookies out", async () => {
    const response = await fetch(`${origin}/echo?q=1`, {
      method: "POST",
      headers: { "x-test": "yes" },
      body: "hello",
    });

    expect(response.status).toBe(201);
    expect(response.statusText).toBe("Created");
    expect(response.headers.getSetCookie()).toEqual(["a=1", "b=2"]);
    expect(await response.json()).toEqual({
      method: "POST",
      url: `${origin}/echo?q=1`,
      header: "yes",
      body: "hello",
    });
  });

  it("writes a streamed body", async () => {
    const response = await fetch(`${origin}/stream`);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("one two three");
  });

  it("sends HTTPError statuses through the catch", async () => {
    const response = await fetch(`${origin}/missing`);

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Not Found");
  });

  it("answers an unpaid request to an x402 resource with 402", async () => {
    const response = await fetch(`${origin}/paid`);

    expect(response.status).toBe(402);
    expect(response.headers.get("payment-required")).toBeTruthy();
    await response.body?.cancel();
  });

  it("serves a paid request to an x402 resource and settles it", async () => {
    const response = await fetch(`${origin}/paid`, {
      headers: {
        "payment-signature": encode({
          x402Version: 2,
          accepted: accepts[0],
          payload: { signature: "0xsig" },
        }),
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("payment-response")).toBeTruthy();
    expect(await response.text()).toBe("Paid content");
  });
});
