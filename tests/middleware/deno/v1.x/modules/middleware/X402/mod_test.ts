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

import { assertEquals } from "@std/assert";
import { catchError, chain } from "../../../../utils.ts";
import { StatusCode } from "../../../../../../../src/core/http/response/StatusCode.ts";
import {
  type HTTPRequest,
  Resource,
} from "../../../../../../../src/modules/http.native.ts";
import {
  type Options,
  X402,
  X402Header,
} from "../../../../../../../src/modules/middleware/X402.ts";
import {
  decode,
  encode,
} from "../../../../../../../src/modules/middleware/x402/Encoding.ts";
import type {
  FacilitatorRequest,
  PaymentPayload,
  PaymentRequired,
  PaymentRequirements,
  SettleResponse,
  VerifyResponse,
} from "../../../../../../../src/modules/middleware/x402/Types.ts";
import { X402ErrorResponse } from "../../../../../../../src/modules/middleware/x402/X402ErrorResponse.ts";

const requirements: PaymentRequirements = {
  scheme: "exact",
  network: "eip155:84532",
  amount: "10000",
  asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  payTo: "0x209693Bc6afc0C5328bA36FaF03C514EF312287C",
  maxTimeoutSeconds: 60,
  extra: { name: "USDC", version: "2" },
};

const payment: PaymentPayload = {
  x402Version: 2,
  accepted: requirements,
  payload: { signature: "0xsignature" },
};

const settlement: SettleResponse = {
  success: true,
  transaction: "0xtransaction",
  network: "eip155:84532",
  payer: "0xpayer",
};

/**
 * A stub facilitator that records which endpoints were called and answers with
 * the given responses.
 */
function facilitator(responses: {
  verify?: VerifyResponse;
  settle?: SettleResponse;
}) {
  const calls: { endpoint: string; body: FacilitatorRequest }[] = [];

  const fetch: typeof globalThis.fetch = (input, init) => {
    const endpoint = String(input).split("/").pop()!;
    calls.push({ endpoint, body: JSON.parse(String(init?.body)) });

    return Promise.resolve(
      Response.json(
        endpoint === "verify" ? responses.verify : responses.settle,
      ),
    );
  };

  return { calls, fetch };
}

function handle(
  options: Options,
  headers: Record<string, string> = {},
  path = "/",
): Promise<Response> {
  return chain({
    middleware: [X402(options)],
    resources: [
      class Broken extends Resource {
        public override paths = ["/broken"];

        public override GET(_request: HTTPRequest) {
          return new Response("Nope", { status: 500 });
        }
      },
    ],
  })
    .handle<Response>(new Request(`http://localhost${path}`, { headers }))
    .catch((error) => {
      return error instanceof X402ErrorResponse
        ? error.response
        : catchError(error);
    });
}

Deno.test("X402", async (t) => {
  await t.step("402 with PAYMENT-REQUIRED when unpaid", async () => {
    const { calls, fetch } = facilitator({});
    const response = await handle({ accepts: [requirements], fetch });

    assertEquals(response.status, StatusCode.PaymentRequired);

    const paymentRequired = decode<PaymentRequired>(
      response.headers.get(X402Header.PaymentRequired)!,
    );

    assertEquals(paymentRequired.x402Version, 2);
    assertEquals(paymentRequired.resource.url, "http://localhost/");
    assertEquals(paymentRequired.accepts, [requirements]);
    assertEquals(await response.json(), paymentRequired);
    assertEquals(calls.length, 0);
  });

  await t.step("400 when PAYMENT-SIGNATURE is malformed", async () => {
    const { calls, fetch } = facilitator({});
    const response = await handle({ accepts: [requirements], fetch }, {
      [X402Header.PaymentSignature]: "not base64 json",
    });

    assertEquals(response.status, StatusCode.BadRequest);
    await response.body?.cancel();
    assertEquals(calls.length, 0);
  });

  await t.step("402 when the payment matches no requirement", async () => {
    const { calls, fetch } = facilitator({});
    const response = await handle({ accepts: [requirements], fetch }, {
      [X402Header.PaymentSignature]: encode({
        ...payment,
        accepted: { ...requirements, amount: "1" },
      }),
    });

    assertEquals(response.status, StatusCode.PaymentRequired);
    await response.body?.cancel();
    assertEquals(calls.length, 0);
  });

  await t.step("402 when the facilitator rejects the payment", async () => {
    const { calls, fetch } = facilitator({
      verify: { isValid: false, invalidReason: "insufficient_funds" },
    });
    const response = await handle({ accepts: [requirements], fetch }, {
      [X402Header.PaymentSignature]: encode(payment),
    });

    assertEquals(response.status, StatusCode.PaymentRequired);
    assertEquals(
      decode<PaymentRequired>(
        response.headers.get(X402Header.PaymentRequired)!,
      ).error,
      "insufficient_funds",
    );
    await response.body?.cancel();
    assertEquals(calls.map((call) => call.endpoint), ["verify"]);
  });

  await t.step("200 with PAYMENT-RESPONSE when paid", async () => {
    const { calls, fetch } = facilitator({
      verify: { isValid: true },
      settle: settlement,
    });
    const response = await handle({
      accepts: [requirements],
      facilitator_url: "https://facilitator.example/",
      fetch,
    }, {
      [X402Header.PaymentSignature]: encode(payment),
    });

    assertEquals(response.status, StatusCode.OK);
    assertEquals(await response.text(), "Oh so easy");
    assertEquals(
      decode<SettleResponse>(response.headers.get(X402Header.PaymentResponse)!),
      settlement,
    );
    assertEquals(calls.map((call) => call.endpoint), ["verify", "settle"]);
    assertEquals(calls[0].body, {
      x402Version: 2,
      paymentPayload: payment,
      paymentRequirements: requirements,
    });
  });

  await t.step("does not settle when the resource errors", async () => {
    const { calls, fetch } = facilitator({
      verify: { isValid: true },
      settle: settlement,
    });
    const response = await handle({ accepts: [requirements], fetch }, {
      [X402Header.PaymentSignature]: encode(payment),
    }, "/broken");

    assertEquals(response.status, 500);
    assertEquals(response.headers.has(X402Header.PaymentResponse), false);
    await response.body?.cancel();
    assertEquals(calls.map((call) => call.endpoint), ["verify"]);
  });

  await t.step("402 with PAYMENT-RESPONSE when settlement fails", async () => {
    const failed: SettleResponse = {
      success: false,
      errorReason: "insufficient_funds",
      transaction: "",
      network: "eip155:84532",
    };
    const { fetch } = facilitator({
      verify: { isValid: true },
      settle: failed,
    });
    const response = await handle({ accepts: [requirements], fetch }, {
      [X402Header.PaymentSignature]: encode(payment),
    });

    assertEquals(response.status, StatusCode.PaymentRequired);
    assertEquals(
      decode<SettleResponse>(response.headers.get(X402Header.PaymentResponse)!),
      failed,
    );
    await response.body?.cancel();
  });

  await t.step("500 when the facilitator is unreachable", async () => {
    const response = await handle({
      accepts: [requirements],
      fetch: () => Promise.reject(new TypeError("network down")),
    }, {
      [X402Header.PaymentSignature]: encode(payment),
    });

    assertEquals(response.status, StatusCode.InternalServerError);
    await response.body?.cancel();
  });

  await t.step("encoding round-trips non-ASCII text", () => {
    const value = { description: "Café ☕ data" };
    assertEquals(decode(encode(value)), value);
  });
});
