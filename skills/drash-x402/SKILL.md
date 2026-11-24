---
name: drash-x402
description: Charging for Drash resources with x402 (HTTP 402 Payment Required). Use when adding a paywall, pay-per-request pricing, or crypto/stablecoin payments to a Drash app, or when editing code that uses Drash's `x402` middleware.
---

# Charging with x402

Drash's `x402` middleware charges for the resources it wraps. An unpaid request
gets a `402` that says what to pay. A paid request is verified by a facilitator,
handed to the resource, and settled after the resource responds. Do not write
payment checks yourself; configure this middleware.

## Wrap the paid resources in a group

`x402` is a factory. Call it with options and pass the class it returns to a
`ResourceGroup`. Only resources in that group are charged; free resources go
straight into the app:

```ts
// Bun imports from http.polyfill.js instead.
import {
  Application,
  HTTPError,
  ResourceGroup,
} from "@drashland/drash/modules/http.native.js";
import {
  x402,
  x402ErrorResponse,
} from "@drashland/drash/modules/middleware/x402.js";

const paid = ResourceGroup
  .builder()
  .resources(ReportResource)
  .middleware(x402({
    accepts: [{
      scheme: "exact",
      network: "eip155:84532", // Base Sepolia (testnet)
      amount: "10000", // 0.01 USDC, in atomic units (6 decimals)
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC
      payTo: Deno.env.get("PAY_TO")!,
      maxTimeoutSeconds: 60,
      extra: { name: "USDC", version: "2" },
    }],
    facilitator_url: Deno.env.get("FACILITATOR_URL")!,
  }))
  .build();

const app = Application.builder().resources(HomeResource, paid).build();
```

The specifiers above are npm's. Deno installs Drash from JSR, whose specifiers
drop the `.js`: `@drashland/drash/modules/middleware/x402`.

- `accepts` and `facilitator_url` are required. There is no default
  facilitator.
- `amount` is a string of atomic token units, not a decimal. For a 6-decimal
  token, `"1000000"` is 1.00.
- Inside `accepts`, use the x402 spec's camelCase names (`payTo`,
  `maxTimeoutSeconds`). The middleware's own options are snake_case
  (`facilitator_url`, `mime_type`).
- Read the wallet address and facilitator URL from the environment. Start on a
  testnet network and switch to mainnet only when the user asks.

## Catch `x402ErrorResponse` first

An unpaid or rejected request rejects `app.handle()` with an
`x402ErrorResponse`. Its `response` carries the `PAYMENT-REQUIRED` header the
client needs in order to pay. Return that response as is:

```ts
app
  .handle<Response>(request)
  .catch((error) => {
    if (error instanceof x402ErrorResponse) {
      return error.response;
    }

    if (error instanceof HTTPError) {
      return new Response(error.message, { status: error.status_code });
    }

    return new Response("Internal Server Error", { status: 500 });
  });
```

`x402ErrorResponse` extends `HTTPError`, so check for it **before** `HTTPError`.
A handler that checks `HTTPError` first sends a bare `402` with no payment
instructions, and no client can pay it.

Import `x402ErrorResponse` from `modules/middleware/x402.js`, and `HTTPError`
from the app's entry point (`http.native.js` or `http.polyfill.js`). On npm,
each entry point bundles its own copy of every class, so `instanceof` against a
class imported from anywhere else is always false.

## On Node, convert at the boundary

The middleware reads a Web `Request` and returns a Web `Response`. On Deno, Bun,
and Cloudflare Workers that is what the app already passes in. A Node app that
passes the `node:http` context object into `app.handle()` cannot use `x402`.
Convert with `toWebRequest` and `writeWebResponse`, and write the resources to
take a `Request` and return a `Response`:

```ts
import { createServer } from "node:http";
import {
  toWebRequest,
  writeWebResponse,
} from "@drashland/drash/modules/adapters/NodeHTTP.js";

createServer((req, res) => {
  app
    .handle<Response>(toWebRequest(req))
    .catch(toErrorResponse) // the x402ErrorResponse-first handler above
    .then((response) => writeWebResponse(res, response));
});
```

Do not convert by hand with `new Request(url, { method })`. That drops the
headers, so the middleware never sees `PAYMENT-SIGNATURE` and every request
gets a `402`.

## Let the resource fail with a status, and keep it free of payment logic

Settlement runs after the resource responds, and only for statuses below `400`.
A resource that cannot serve the request returns a `4xx`/`5xx` response or
throws an `HTTPError`, and the client is not charged. Do not return `200` with
an error body.

The resource does not read `PAYMENT-SIGNATURE`, track who has paid, or guard
against replays. The facilitator does all of that. Do not add a database of
payments.

## Tests use the `fetch` option

The middleware calls the facilitator through the `fetch` option. In tests, pass
a stub that answers `/verify` with `{ "isValid": true }` and `/settle` with
`{ "success": true, "transaction": "0x...", "network": "eip155:84532" }`, and
build the `PAYMENT-SIGNATURE` header with `encode()` from
`@drashland/drash/modules/middleware/x402/Encoding.js`. Do not call a real
facilitator from tests.

Use the same option to add credentials a hosted facilitator requires, such as an
`Authorization` header.

See <https://drash.crookse.com/reference/modules/middleware/x402> for every
option and the full request flow.
