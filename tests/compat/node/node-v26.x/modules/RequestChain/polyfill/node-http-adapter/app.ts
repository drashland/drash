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

import { createServer, type Server } from "node:http";

import {
  toWebRequest,
  writeWebResponse,
} from "../../../../../../../../dist/modules/adapters/NodeHTTP";
// HTTPError and x402ErrorResponse come from the entry points that throw them.
// Each npm entry point bundles its own copy of every class, so `instanceof`
// only matches a class imported from the bundle that threw it.
import {
  Application,
  HTTPError,
  type HTTPRequest,
  Resource,
  ResourceGroup,
} from "../../../../../../../../dist/modules/http.polyfill";
import {
  x402,
  x402ErrorResponse,
} from "../../../../../../../../dist/modules/middleware/x402";
import type { PaymentRequirements } from "../../../../../../../../dist/modules/middleware/x402/Types";

export const accepts: PaymentRequirements[] = [{
  scheme: "exact",
  network: "eip155:84532",
  amount: "10000",
  asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  payTo: "0x0000000000000000000000000000000000000001",
  maxTimeoutSeconds: 60,
}];

class Echo extends Resource {
  public paths = ["/echo"];

  // Sends back what the adapter put in the Request, so the test can see that
  // the method, URL, headers, and body all survived the conversion
  public POST(request: HTTPRequest) {
    return request.text().then((body) => {
      const headers = new Headers({ "content-type": "application/json" });
      headers.append("set-cookie", "a=1");
      headers.append("set-cookie", "b=2");

      return new Response(
        JSON.stringify({
          method: request.method,
          url: request.url,
          header: request.headers.get("x-test"),
          body,
        }),
        { status: 201, statusText: "Created", headers },
      );
    });
  }
}

class Stream extends Resource {
  public paths = ["/stream"];

  public GET(_request: Request) {
    const encoder = new TextEncoder();
    const parts = ["one ", "two ", "three"];

    return new Response(
      new ReadableStream<Uint8Array>({
        pull(controller) {
          const part = parts.shift();
          part === undefined
            ? controller.close()
            : controller.enqueue(encoder.encode(part));
        },
      }),
    );
  }
}

class Paid extends Resource {
  public paths = ["/paid"];

  public GET(_request: Request) {
    return new Response("Paid content");
  }
}

// A facilitator that approves every payment, so x402 can run without a network
const facilitator: typeof fetch = (input) => {
  const body = String(input).endsWith("/verify")
    ? { isValid: true }
    : { success: true, transaction: "0xabc", network: "eip155:84532" };

  return Promise.resolve(Response.json(body));
};

const paid = ResourceGroup
  .builder()
  .resources(Paid)
  .middleware(x402({
    accepts,
    facilitator_url: "https://facilitator.test",
    fetch: facilitator,
  }))
  .build();

const app = Application
  .builder()
  .resources(Echo, Stream, paid)
  .build();

function toErrorResponse(error: unknown): Response {
  if (error instanceof x402ErrorResponse) {
    return error.response;
  }

  if (error instanceof HTTPError) {
    return new Response(error.message, { status: error.status_code });
  }

  return new Response("Internal Server Error", { status: 500 });
}

/**
 * Start the app on a free port.
 *
 * @returns The server and the origin it listens on.
 */
export function start(): Promise<{ server: Server; origin: string }> {
  const server = createServer((req, res) => {
    app
      .handle<Response>(toWebRequest(req))
      .catch(toErrorResponse)
      .then((response) => writeWebResponse(res, response));
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({ server, origin: `http://127.0.0.1:${port}` });
    });
  });
}
