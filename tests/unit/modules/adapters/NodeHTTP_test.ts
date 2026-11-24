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

import * as asserts from "@std/assert";
import {
  type NodeIncomingMessageLike,
  type NodeServerResponseLike,
  toWebRequest,
  writeWebResponse,
} from "../../../../src/modules/adapters/NodeHTTP.ts";

// The fakes below are plain objects, not `node:stream` streams. Type-checking
// any `node:` import needs `@types/node` from node_modules, and the unit tests
// run without an install. The real `node:http` objects are exercised by the
// node-http-adapter compat tests.

const decoder = new TextDecoder();

/**
 * A request shaped like `node:http`'s `IncomingMessage`: an async-iterable body
 * plus `url`, `method`, and `headers`.
 */
function fakeRequest(
  fields: Omit<NodeIncomingMessageLike, typeof Symbol.asyncIterator>,
  body: (string | Uint8Array)[] = [],
): NodeIncomingMessageLike {
  return {
    ...fields,
    async *[Symbol.asyncIterator]() {
      yield* body;
    },
  };
}

/**
 * A response shaped like `node:http`'s `ServerResponse`, recording what is
 * written to it. Like Node, `write()` returns `false` once `highWaterMark`
 * bytes are buffered and emits `drain` when the buffer empties.
 */
class FakeServerResponse implements NodeServerResponseLike {
  statusCode = 200;
  statusMessage = "";
  headers = new Map<string, string | string[]>();
  chunks: string[] = [];
  drains = 0;
  writableFinished = false;

  #highWaterMark: number;
  #buffered = 0;
  #listeners = new Map<string, ((...args: unknown[]) => void)[]>();

  constructor(options: { highWaterMark?: number } = {}) {
    this.#highWaterMark = options.highWaterMark ?? Infinity;
  }

  setHeader(name: string, value: string | string[]) {
    this.headers.set(name, value);
  }

  write(chunk: Uint8Array): boolean {
    this.chunks.push(decoder.decode(chunk));
    this.#buffered += chunk.byteLength;

    if (this.#buffered < this.#highWaterMark) {
      return true;
    }

    // Flush asynchronously, as a socket would
    setTimeout(() => {
      this.#buffered = 0;
      this.drains++;
      this.#emit("drain");
    }, 1);

    return false;
  }

  end() {
    setTimeout(() => {
      this.writableFinished = true;
      this.#emit("finish");
    }, 0);
  }

  once(event: string, listener: (...args: unknown[]) => void) {
    this.#listeners.set(event, [
      ...(this.#listeners.get(event) ?? []),
      listener,
    ]);
  }

  #emit(event: string) {
    const listeners = this.#listeners.get(event) ?? [];
    this.#listeners.delete(event);
    listeners.forEach((listener) => listener());
  }
}

Deno.test("toWebRequest()", async (t) => {
  await t.step("resolves the path against the Host header", () => {
    const request = toWebRequest(fakeRequest({
      url: "/users/1?full=true",
      method: "GET",
      headers: { host: "localhost:1447" },
    }));

    asserts.assertEquals(
      request.url,
      "http://localhost:1447/users/1?full=true",
    );
  });

  await t.step("uses https on a TLS socket", () => {
    const request = toWebRequest(fakeRequest({
      url: "/",
      method: "GET",
      headers: { host: "example.com" },
      socket: { encrypted: true },
    }));

    asserts.assertEquals(request.url, "https://example.com/");
  });

  await t.step("prefers the origin option over the Host header", () => {
    const request = toWebRequest(
      fakeRequest({
        url: "/x",
        method: "GET",
        headers: { host: "attacker.example" },
      }),
      { origin: "https://api.example.com" },
    );

    asserts.assertEquals(request.url, "https://api.example.com/x");
  });

  await t.step("falls back to localhost without a Host header", () => {
    const request = toWebRequest(fakeRequest({ url: "/", headers: {} }));

    asserts.assertEquals(request.url, "http://localhost/");
    asserts.assertEquals(request.method, "GET");
  });

  await t.step("copies every header, including repeated ones", () => {
    const request = toWebRequest(fakeRequest({
      url: "/",
      method: "GET",
      headers: {
        host: "localhost",
        "payment-signature": "abc",
        "x-forwarded-for": ["1.1.1.1", "2.2.2.2"],
        "x-missing": undefined,
      },
    }));

    asserts.assertEquals(request.headers.get("payment-signature"), "abc");
    asserts.assertEquals(
      request.headers.get("x-forwarded-for"),
      "1.1.1.1, 2.2.2.2",
    );
    asserts.assertFalse(request.headers.has("x-missing"));
  });

  await t.step("streams the body of a POST", async () => {
    const request = toWebRequest(fakeRequest(
      { url: "/", method: "post", headers: { host: "localhost" } },
      ["hello ", new TextEncoder().encode("world")],
    ));

    asserts.assertEquals(request.method, "POST");
    asserts.assertEquals(await request.text(), "hello world");
  });

  await t.step("gives GET and HEAD no body", () => {
    for (const method of ["GET", "HEAD"]) {
      const request = toWebRequest(fakeRequest(
        { url: "/", method, headers: { host: "localhost" } },
        ["ignored"],
      ));

      asserts.assertEquals(request.body, null);
    }
  });
});

Deno.test("writeWebResponse()", async (t) => {
  await t.step(
    "writes the status, status text, headers, and body",
    async () => {
      const response = new FakeServerResponse();

      await writeWebResponse(
        response,
        new Response("Payment required", {
          status: 402,
          statusText: "Payment Required",
          headers: { "payment-required": "eyJ9" },
        }),
      );

      asserts.assertEquals(response.statusCode, 402);
      asserts.assertEquals(response.statusMessage, "Payment Required");
      asserts.assertEquals(response.headers.get("payment-required"), "eyJ9");
      asserts.assertEquals(response.chunks.join(""), "Payment required");
    },
  );

  await t.step("keeps each Set-Cookie header separate", async () => {
    const response = new FakeServerResponse();
    const headers = new Headers();
    headers.append("set-cookie", "a=1");
    headers.append("set-cookie", "b=2");

    await writeWebResponse(response, new Response(null, { headers }));

    asserts.assertEquals(response.headers.get("set-cookie"), ["a=1", "b=2"]);
  });

  await t.step("ends a response that has no body", async () => {
    const response = new FakeServerResponse();

    await writeWebResponse(response, new Response(null, { status: 204 }));

    asserts.assertEquals(response.statusCode, 204);
    asserts.assertEquals(response.chunks, []);
    asserts.assert(response.writableFinished);
  });

  await t.step(
    "streams the body chunk by chunk under backpressure",
    async () => {
      const response = new FakeServerResponse({ highWaterMark: 1 });
      const parts = ["one ", "two ", "three"];

      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          parts.forEach((part) =>
            controller.enqueue(new TextEncoder().encode(part))
          );
          controller.close();
        },
      });

      await writeWebResponse(response, new Response(body));

      asserts.assertEquals(response.chunks, parts);
      asserts.assert(
        response.drains > 0,
        "expected write() to hit backpressure",
      );
    },
  );
});
