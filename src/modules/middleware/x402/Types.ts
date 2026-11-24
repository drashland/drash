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
 * The x402 (version 2) message types the x402 middleware sends, receives, and
 * exchanges with a facilitator. Field names match the x402 specification, so
 * they are camelCase rather than Drash's usual snake_case.
 *
 * @see https://github.com/coinbase/x402/blob/main/specs/x402-specification-v2.md
 *
 * @module
 */

/**
 * The x402 protocol version this middleware speaks.
 */
const X402_VERSION = 2;

/**
 * The resource being paid for.
 */
type ResourceInfo = {
  /** URL of the protected resource. */
  url: string;

  /** Human-readable description of the resource. */
  description?: string;

  /** MIME type of the expected response. */
  mimeType?: string;
};

/**
 * One payment method the server accepts.
 */
type PaymentRequirements = {
  /** Payment scheme identifier (e.g., `"exact"`). */
  scheme: string;

  /** Network identifier in CAIP-2 format (e.g., `"eip155:84532"`). */
  network: string;

  /** Required payment amount in atomic token units. */
  amount: string;

  /** Token contract address, or ISO 4217 currency code for fiat. */
  asset: string;

  /** Recipient wallet address. */
  payTo: string;

  /** Maximum time allowed for payment completion. */
  maxTimeoutSeconds: number;

  /** Scheme-specific information (e.g., the token's EIP-712 name/version). */
  extra?: Record<string, unknown>;
};

/**
 * What the server sends (in the `PAYMENT-REQUIRED` header) when a request has
 * not been paid for.
 */
type PaymentRequired = {
  x402Version: number;
  error?: string;
  resource: ResourceInfo;
  accepts: PaymentRequirements[];
  extensions?: Record<string, unknown>;
};

/**
 * What the client sends (in the `PAYMENT-SIGNATURE` header) to pay.
 */
type PaymentPayload = {
  x402Version: number;
  resource?: ResourceInfo;

  /** The entry from `accepts` the client chose to pay with. */
  accepted: PaymentRequirements;

  /** Scheme-specific payment data (e.g., a signature and authorization). */
  payload: Record<string, unknown>;

  extensions?: Record<string, unknown>;
};

/**
 * The body POSTed to the facilitator's `/verify` and `/settle` endpoints.
 */
type FacilitatorRequest = {
  x402Version: number;
  paymentPayload: PaymentPayload;
  paymentRequirements: PaymentRequirements;
};

/**
 * The facilitator's `/verify` response.
 */
type VerifyResponse = {
  isValid: boolean;
  invalidReason?: string;
  payer?: string;
};

/**
 * The facilitator's `/settle` response, which the server forwards to the client
 * in the `PAYMENT-RESPONSE` header.
 */
type SettleResponse = {
  success: boolean;
  errorReason?: string;
  payer?: string;
  transaction: string;
  network: string;
  amount?: string;
  extensions?: Record<string, unknown>;
};

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export {
  type FacilitatorRequest,
  type PaymentPayload,
  type PaymentRequired,
  type PaymentRequirements,
  type ResourceInfo,
  type SettleResponse,
  type VerifyResponse,
  X402_VERSION,
};
