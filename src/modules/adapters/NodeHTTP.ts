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

/**
 * Converts between `node:http` and the Web `Request`/`Response` the rest of
 * Drash speaks, so a Node app can pass a real `Request` into a chain and write
 * the `Response` it gets back. With these at the boundary, middleware written
 * against Web `Request`/`Response` (`x402`, `CORS`, `ETag`, ...) works on Node.
 *
 * Nothing here imports `node:http`; the parameters are typed by shape, so this
 * module loads on every runtime Drash supports.
 *
 * @module
 */

/**
 * The parts of `node:http`'s `IncomingMessage` that {@link toWebRequest} reads.
 */
type NodeIncomingMessageLike = AsyncIterable<Uint8Array | string> & {
  /** Path and query, e.g. `/users/1?full=true`. */
  url?: string;

  method?: string;

  /** Header names are lowercase. Repeated headers arrive as arrays. */
  headers: Record<string, string | string[] | undefined>;

  /** A `tls.TLSSocket` has `encrypted: true`, which means the URL is https. */
  socket?: unknown;
};

/**
 * The parts of `node:http`'s `ServerResponse` that {@link writeWebResponse}
 * writes to.
 */
type NodeServerResponseLike = {
  statusCode: number;
  statusMessage: string;
  setHeader(name: string, value: string | string[]): unknown;
  write(chunk: Uint8Array): boolean;
  end(): unknown;
  once(event: string, listener: (...args: unknown[]) => void): unknown;
  destroy?(error?: Error): unknown;
};

/**
 * Options for {@link toWebRequest}.
 */
type ToWebRequestOptions = {
  /**
   * The scheme and host to put in front of the request's path, e.g.
   * `https://api.example.com`. Defaults to `http://` (or `https://` on a TLS
   * socket) plus the request's `Host` header. Set it when the app sits behind
   * a proxy, or when it should not trust the `Host` header.
   */
  origin?: string;
};

/**
 * `RequestInit` with `duplex`, which Node's `Request` requires when the body is
 * a stream. TypeScript's DOM types do not declare it yet.
 */
type StreamingRequestInit = RequestInit & { duplex?: "half" };

const encoder = new TextEncoder();

/**
 * Build a Web `Request` from a `node:http` request: an absolute URL, every
 * header, and the body as a stream.
 *
 * @param request The `IncomingMessage` from `node:http`'s request listener.
 * @param options See {@link ToWebRequestOptions}.
 * @returns A `Request` that can be passed to `app.handle()`.
 */
function toWebRequest(
  request: NodeIncomingMessageLike,
  options: ToWebRequestOptions = {},
): Request {
  const method = (request.method ?? "GET").toUpperCase();

  const headers = new Headers();

  for (const [name, value] of Object.entries(request.headers)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(name, item));
    } else {
      headers.set(name, value);
    }
  }

  const init: StreamingRequestInit = { method, headers };

  if (method !== "GET" && method !== "HEAD") {
    init.body = readableStreamFrom(request);
    init.duplex = "half";
  }

  return new Request(
    new URL(request.url ?? "/", options.origin ?? defaultOrigin(request)),
    init,
  );
}

/**
 * Write a Web `Response` to a `node:http` response: status, headers, and the
 * body, chunk by chunk, so a streamed body (e.g., server-sent events) stays
 * streamed.
 *
 * @param response The `ServerResponse` from `node:http`'s request listener.
 * @param webResponse The `Response` to send, e.g. what `app.handle()` resolved
 * with, or the `response` of an `x402ErrorResponse`.
 * @returns A promise that resolves once the response is finished, or once the
 * client disconnects.
 */
function writeWebResponse(
  response: NodeServerResponseLike,
  webResponse: Response,
): Promise<void> {
  response.statusCode = webResponse.status;

  if (webResponse.statusText) {
    response.statusMessage = webResponse.statusText;
  }

  // Set-Cookie is the one header that cannot be joined into a single value, so
  // it is set from `getSetCookie()` instead of from `forEach()`
  webResponse.headers.forEach((value, name) => {
    if (name !== "set-cookie") {
      response.setHeader(name, value);
    }
  });

  const cookies = webResponse.headers.getSetCookie();

  if (cookies.length > 0) {
    response.setHeader("set-cookie", cookies);
  }

  let closed = false;

  const done = new Promise<void>((resolve, reject) => {
    response.once("finish", () => resolve());
    response.once("error", (error) => reject(error));
    response.once("close", () => {
      closed = true;
      resolve();
    });
  });

  if (!webResponse.body) {
    response.end();
    return done;
  }

  const reader = webResponse.body.getReader();

  const pump = (): Promise<void> => {
    if (closed) {
      return reader.cancel();
    }

    return reader.read().then(({ done, value }) => {
      if (done) {
        response.end();
        return;
      }

      if (response.write(value)) {
        return pump();
      }

      // The socket's buffer is full. Wait for it to drain (or for the client
      // to go away) before reading more
      return new Promise<void>((resolve) => {
        response.once("drain", () => resolve());
        response.once("close", () => resolve());
      }).then(pump);
    });
  };

  return pump()
    .catch((error: Error) => {
      response.destroy?.(error);
      throw error;
    })
    .then(() => done);
}

/**
 * The origin to resolve a request's path against when none is given.
 *
 * @param request The `node:http` request.
 * @returns E.g. `http://localhost:1447`.
 */
function defaultOrigin(request: NodeIncomingMessageLike): string {
  const socket = request.socket as { encrypted?: boolean } | undefined;
  const scheme = socket?.encrypted ? "https" : "http";
  const host = request.headers.host;

  return `${scheme}://${typeof host === "string" ? host : "localhost"}`;
}

/**
 * Wrap a Node readable (anything async-iterable) in a Web `ReadableStream`,
 * pulling one chunk at a time so the request body is never buffered whole.
 *
 * @param source The `node:http` request.
 * @returns The request body as a stream of bytes.
 */
function readableStreamFrom(
  source: AsyncIterable<Uint8Array | string>,
): ReadableStream<Uint8Array> {
  const iterator = source[Symbol.asyncIterator]();

  return new ReadableStream<Uint8Array>({
    pull(controller) {
      return iterator.next().then(({ done, value }) => {
        if (done) {
          controller.close();
          return;
        }

        controller.enqueue(
          typeof value === "string" ? encoder.encode(value) : value,
        );
      });
    },
    cancel(reason) {
      return iterator.return?.(reason).then(() => undefined);
    },
  });
}

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export {
  type NodeIncomingMessageLike,
  type NodeServerResponseLike,
  toWebRequest,
  type ToWebRequestOptions,
  writeWebResponse,
};
