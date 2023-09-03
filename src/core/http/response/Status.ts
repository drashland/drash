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

// Imports > Core
import { StatusCode } from "./StatusCode.ts";
import { StatusDescription } from "./StatusDescription.ts";
import type { ResponseStatusCode } from "../../types/ResponseStatusCode.ts";
import type { ResponseStatusDescription } from "../../types/ResponseStatusDescription.ts";
import type { ResponseStatusName } from "../../types/ResponseStatusName.ts";

export const Status: Record<
  ResponseStatusName,
  readonly [ResponseStatusCode, ResponseStatusDescription]
> = {
  Continue: [
    StatusCode.Continue,
    StatusDescription.Continue,
  ],
  SwitchingProtocols: [
    StatusCode.SwitchingProtocols,
    StatusDescription.SwitchingProtocols,
  ],
  Processing: [
    StatusCode.Processing,
    StatusDescription.Processing,
  ],
  EarlyHints: [
    StatusCode.EarlyHints,
    StatusDescription.EarlyHints,
  ],
  OK: [
    StatusCode.OK,
    StatusDescription.OK,
  ],
  Created: [
    StatusCode.Created,
    StatusDescription.Created,
  ],
  Accepted: [
    StatusCode.Accepted,
    StatusDescription.Accepted,
  ],
  NonAuthoritativeInformation: [
    StatusCode.NonAuthoritativeInformation,
    StatusDescription.NonAuthoritativeInformation,
  ],
  NoContent: [
    StatusCode.NoContent,
    StatusDescription.NoContent,
  ],
  ResetContent: [
    StatusCode.ResetContent,
    StatusDescription.ResetContent,
  ],
  PartialContent: [
    StatusCode.PartialContent,
    StatusDescription.PartialContent,
  ],
  MultiStatus: [
    StatusCode.MultiStatus,
    StatusDescription.MultiStatus,
  ],
  AlreadyReported: [
    StatusCode.AlreadyReported,
    StatusDescription.AlreadyReported,
  ],
  IMUsed: [
    StatusCode.IMUsed,
    StatusDescription.IMUsed,
  ],
  MultipleChoices: [
    StatusCode.MultipleChoices,
    StatusDescription.MultipleChoices,
  ],
  MovedPermanently: [
    StatusCode.MovedPermanently,
    StatusDescription.MovedPermanently,
  ],
  Found: [
    StatusCode.Found,
    StatusDescription.Found,
  ],
  SeeOther: [
    StatusCode.SeeOther,
    StatusDescription.SeeOther,
  ],
  NotModified: [
    StatusCode.NotModified,
    StatusDescription.NotModified,
  ],
  UseProxy: [
    StatusCode.UseProxy,
    StatusDescription.UseProxy,
  ],
  TemporaryRedirect: [
    StatusCode.TemporaryRedirect,
    StatusDescription.TemporaryRedirect,
  ],
  PermanentRedirect: [
    StatusCode.PermanentRedirect,
    StatusDescription.PermanentRedirect,
  ],
  BadRequest: [
    StatusCode.BadRequest,
    StatusDescription.BadRequest,
  ],
  Unauthorized: [
    StatusCode.Unauthorized,
    StatusDescription.Unauthorized,
  ],
  PaymentRequired: [
    StatusCode.PaymentRequired,
    StatusDescription.PaymentRequired,
  ],
  Forbidden: [
    StatusCode.Forbidden,
    StatusDescription.Forbidden,
  ],
  NotFound: [
    StatusCode.NotFound,
    StatusDescription.NotFound,
  ],
  MethodNotAllowed: [
    StatusCode.MethodNotAllowed,
    StatusDescription.MethodNotAllowed,
  ],
  NotAcceptable: [
    StatusCode.NotAcceptable,
    StatusDescription.NotAcceptable,
  ],
  ProxyAuthenticationRequired: [
    StatusCode.ProxyAuthenticationRequired,
    StatusDescription.ProxyAuthenticationRequired,
  ],
  RequestTimeout: [
    StatusCode.RequestTimeout,
    StatusDescription.RequestTimeout,
  ],
  Conflict: [
    StatusCode.Conflict,
    StatusDescription.Conflict,
  ],
  Gone: [
    StatusCode.Gone,
    StatusDescription.Gone,
  ],
  LengthRequired: [
    StatusCode.LengthRequired,
    StatusDescription.LengthRequired,
  ],
  PreconditionFailed: [
    StatusCode.PreconditionFailed,
    StatusDescription.PreconditionFailed,
  ],
  PayloadTooLarge: [
    StatusCode.PayloadTooLarge,
    StatusDescription.PayloadTooLarge,
  ],
  URITooLong: [
    StatusCode.URITooLong,
    StatusDescription.URITooLong,
  ],
  UnsupportedMediaType: [
    StatusCode.UnsupportedMediaType,
    StatusDescription.UnsupportedMediaType,
  ],
  RangeNotSatisfiable: [
    StatusCode.RangeNotSatisfiable,
    StatusDescription.RangeNotSatisfiable,
  ],
  ExpectationFailed: [
    StatusCode.ExpectationFailed,
    StatusDescription.ExpectationFailed,
  ],
  Imateapot: [
    StatusCode.Imateapot,
    StatusDescription.Imateapot,
  ],
  MisdirectedRequest: [
    StatusCode.MisdirectedRequest,
    StatusDescription.MisdirectedRequest,
  ],
  UnprocessableEntity: [
    StatusCode.UnprocessableEntity,
    StatusDescription.UnprocessableEntity,
  ],
  Locked: [
    StatusCode.Locked,
    StatusDescription.Locked,
  ],
  FailedDependency: [
    StatusCode.FailedDependency,
    StatusDescription.FailedDependency,
  ],
  TooEarly: [
    StatusCode.TooEarly,
    StatusDescription.TooEarly,
  ],
  UpgradeRequired: [
    StatusCode.UpgradeRequired,
    StatusDescription.UpgradeRequired,
  ],
  PreconditionRequired: [
    StatusCode.PreconditionRequired,
    StatusDescription.PreconditionRequired,
  ],
  TooManyRequests: [
    StatusCode.TooManyRequests,
    StatusDescription.TooManyRequests,
  ],
  RequestHeaderFieldsTooLarge: [
    StatusCode.RequestHeaderFieldsTooLarge,
    StatusDescription.RequestHeaderFieldsTooLarge,
  ],
  UnavailableForLegalReasons: [
    StatusCode.UnavailableForLegalReasons,
    StatusDescription.UnavailableForLegalReasons,
  ],
  InternalServerError: [
    StatusCode.InternalServerError,
    StatusDescription.InternalServerError,
  ],
  NotImplemented: [
    StatusCode.NotImplemented,
    StatusDescription.NotImplemented,
  ],
  BadGateway: [
    StatusCode.BadGateway,
    StatusDescription.BadGateway,
  ],
  ServiceUnavailable: [
    StatusCode.ServiceUnavailable,
    StatusDescription.ServiceUnavailable,
  ],
  GatewayTimeout: [
    StatusCode.GatewayTimeout,
    StatusDescription.GatewayTimeout,
  ],
  HTTPVersionNotSupported: [
    StatusCode.HTTPVersionNotSupported,
    StatusDescription.HTTPVersionNotSupported,
  ],
  VariantAlsoNegotiates: [
    StatusCode.VariantAlsoNegotiates,
    StatusDescription.VariantAlsoNegotiates,
  ],
  InsufficientStorage: [
    StatusCode.InsufficientStorage,
    StatusDescription.InsufficientStorage,
  ],
  LoopDetected: [
    StatusCode.LoopDetected,
    StatusDescription.LoopDetected,
  ],
  NotExtended: [
    StatusCode.NotExtended,
    StatusDescription.NotExtended,
  ],
  NetworkAuthenticationRequired: [
    StatusCode.NetworkAuthenticationRequired,
    StatusDescription.NetworkAuthenticationRequired,
  ],
} as const;
