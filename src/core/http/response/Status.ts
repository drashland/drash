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
  {
    readonly code: ResponseStatusCode;
    readonly description: ResponseStatusDescription;
  }
> = {
  Continue: {
    code: StatusCode.Continue,
    description: StatusDescription.Continue,
  },
  SwitchingProtocols: {
    code: StatusCode.SwitchingProtocols,
    description: StatusDescription.SwitchingProtocols,
  },
  Processing: {
    code: StatusCode.Processing,
    description: StatusDescription.Processing,
  },
  EarlyHints: {
    code: StatusCode.EarlyHints,
    description: StatusDescription.EarlyHints,
  },
  OK: {
    code: StatusCode.OK,
    description: StatusDescription.OK,
  },
  Created: {
    code: StatusCode.Created,
    description: StatusDescription.Created,
  },
  Accepted: {
    code: StatusCode.Accepted,
    description: StatusDescription.Accepted,
  },
  NonAuthoritativeInformation: {
    code: StatusCode.NonAuthoritativeInformation,
    description: StatusDescription.NonAuthoritativeInformation,
  },
  NoContent: {
    code: StatusCode.NoContent,
    description: StatusDescription.NoContent,
  },
  ResetContent: {
    code: StatusCode.ResetContent,
    description: StatusDescription.ResetContent,
  },
  PartialContent: {
    code: StatusCode.PartialContent,
    description: StatusDescription.PartialContent,
  },
  MultiStatus: {
    code: StatusCode.MultiStatus,
    description: StatusDescription.MultiStatus,
  },
  AlreadyReported: {
    code: StatusCode.AlreadyReported,
    description: StatusDescription.AlreadyReported,
  },
  IMUsed: {
    code: StatusCode.IMUsed,
    description: StatusDescription.IMUsed,
  },
  MultipleChoices: {
    code: StatusCode.MultipleChoices,
    description: StatusDescription.MultipleChoices,
  },
  MovedPermanently: {
    code: StatusCode.MovedPermanently,
    description: StatusDescription.MovedPermanently,
  },
  Found: {
    code: StatusCode.Found,
    description: StatusDescription.Found,
  },
  SeeOther: {
    code: StatusCode.SeeOther,
    description: StatusDescription.SeeOther,
  },
  NotModified: {
    code: StatusCode.NotModified,
    description: StatusDescription.NotModified,
  },
  UseProxy: {
    code: StatusCode.UseProxy,
    description: StatusDescription.UseProxy,
  },
  TemporaryRedirect: {
    code: StatusCode.TemporaryRedirect,
    description: StatusDescription.TemporaryRedirect,
  },
  PermanentRedirect: {
    code: StatusCode.PermanentRedirect,
    description: StatusDescription.PermanentRedirect,
  },
  BadRequest: {
    code: StatusCode.BadRequest,
    description: StatusDescription.BadRequest,
  },
  Unauthorized: {
    code: StatusCode.Unauthorized,
    description: StatusDescription.Unauthorized,
  },
  PaymentRequired: {
    code: StatusCode.PaymentRequired,
    description: StatusDescription.PaymentRequired,
  },
  Forbidden: {
    code: StatusCode.Forbidden,
    description: StatusDescription.Forbidden,
  },
  NotFound: {
    code: StatusCode.NotFound,
    description: StatusDescription.NotFound,
  },
  MethodNotAllowed: {
    code: StatusCode.MethodNotAllowed,
    description: StatusDescription.MethodNotAllowed,
  },
  NotAcceptable: {
    code: StatusCode.NotAcceptable,
    description: StatusDescription.NotAcceptable,
  },
  ProxyAuthenticationRequired: {
    code: StatusCode.ProxyAuthenticationRequired,
    description: StatusDescription.ProxyAuthenticationRequired,
  },
  RequestTimeout: {
    code: StatusCode.RequestTimeout,
    description: StatusDescription.RequestTimeout,
  },
  Conflict: {
    code: StatusCode.Conflict,
    description: StatusDescription.Conflict,
  },
  Gone: {
    code: StatusCode.Gone,
    description: StatusDescription.Gone,
  },
  LengthRequired: {
    code: StatusCode.LengthRequired,
    description: StatusDescription.LengthRequired,
  },
  PreconditionFailed: {
    code: StatusCode.PreconditionFailed,
    description: StatusDescription.PreconditionFailed,
  },
  PayloadTooLarge: {
    code: StatusCode.PayloadTooLarge,
    description: StatusDescription.PayloadTooLarge,
  },
  URITooLong: {
    code: StatusCode.URITooLong,
    description: StatusDescription.URITooLong,
  },
  UnsupportedMediaType: {
    code: StatusCode.UnsupportedMediaType,
    description: StatusDescription.UnsupportedMediaType,
  },
  RangeNotSatisfiable: {
    code: StatusCode.RangeNotSatisfiable,
    description: StatusDescription.RangeNotSatisfiable,
  },
  ExpectationFailed: {
    code: StatusCode.ExpectationFailed,
    description: StatusDescription.ExpectationFailed,
  },
  Imateapot: {
    code: StatusCode.Imateapot,
    description: StatusDescription.Imateapot,
  },
  MisdirectedRequest: {
    code: StatusCode.MisdirectedRequest,
    description: StatusDescription.MisdirectedRequest,
  },
  UnprocessableEntity: {
    code: StatusCode.UnprocessableEntity,
    description: StatusDescription.UnprocessableEntity,
  },
  Locked: {
    code: StatusCode.Locked,
    description: StatusDescription.Locked,
  },
  FailedDependency: {
    code: StatusCode.FailedDependency,
    description: StatusDescription.FailedDependency,
  },
  TooEarly: {
    code: StatusCode.TooEarly,
    description: StatusDescription.TooEarly,
  },
  UpgradeRequired: {
    code: StatusCode.UpgradeRequired,
    description: StatusDescription.UpgradeRequired,
  },
  PreconditionRequired: {
    code: StatusCode.PreconditionRequired,
    description: StatusDescription.PreconditionRequired,
  },
  TooManyRequests: {
    code: StatusCode.TooManyRequests,
    description: StatusDescription.TooManyRequests,
  },
  RequestHeaderFieldsTooLarge: {
    code: StatusCode.RequestHeaderFieldsTooLarge,
    description: StatusDescription.RequestHeaderFieldsTooLarge,
  },
  UnavailableForLegalReasons: {
    code: StatusCode.UnavailableForLegalReasons,
    description: StatusDescription.UnavailableForLegalReasons,
  },
  InternalServerError: {
    code: StatusCode.InternalServerError,
    description: StatusDescription.InternalServerError,
  },
  NotImplemented: {
    code: StatusCode.NotImplemented,
    description: StatusDescription.NotImplemented,
  },
  BadGateway: {
    code: StatusCode.BadGateway,
    description: StatusDescription.BadGateway,
  },
  ServiceUnavailable: {
    code: StatusCode.ServiceUnavailable,
    description: StatusDescription.ServiceUnavailable,
  },
  GatewayTimeout: {
    code: StatusCode.GatewayTimeout,
    description: StatusDescription.GatewayTimeout,
  },
  HTTPVersionNotSupported: {
    code: StatusCode.HTTPVersionNotSupported,
    description: StatusDescription.HTTPVersionNotSupported,
  },
  VariantAlsoNegotiates: {
    code: StatusCode.VariantAlsoNegotiates,
    description: StatusDescription.VariantAlsoNegotiates,
  },
  InsufficientStorage: {
    code: StatusCode.InsufficientStorage,
    description: StatusDescription.InsufficientStorage,
  },
  LoopDetected: {
    code: StatusCode.LoopDetected,
    description: StatusDescription.LoopDetected,
  },
  NotExtended: {
    code: StatusCode.NotExtended,
    description: StatusDescription.NotExtended,
  },
  NetworkAuthenticationRequired: {
    code: StatusCode.NetworkAuthenticationRequired,
    description: StatusDescription.NetworkAuthenticationRequired,
  },
} as const;
