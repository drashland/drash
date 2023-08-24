/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
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
import { StatusCode as StatusCodeEnum } from "../../../core/http/response/StatusCode.ts";

const StatusCode: Record<keyof typeof StatusCodeEnum, StatusCodeEnum> = {
  Continue: StatusCodeEnum.Continue,
  SwitchingProtocols: StatusCodeEnum.SwitchingProtocols,
  Processing: StatusCodeEnum.Processing,
  EarlyHints: StatusCodeEnum.EarlyHints,
  OK: StatusCodeEnum.OK,
  Created: StatusCodeEnum.Created,
  Accepted: StatusCodeEnum.Accepted,
  NonAuthoritativeInformation: StatusCodeEnum.NonAuthoritativeInformation,
  NoContent: StatusCodeEnum.NoContent,
  ResetContent: StatusCodeEnum.ResetContent,
  PartialContent: StatusCodeEnum.PartialContent,
  MultiStatus: StatusCodeEnum.MultiStatus,
  AlreadyReported: StatusCodeEnum.AlreadyReported,
  IMUsed: StatusCodeEnum.IMUsed,
  MultipleChoices: StatusCodeEnum.MultipleChoices,
  MovedPermanently: StatusCodeEnum.MovedPermanently,
  Found: StatusCodeEnum.Found,
  SeeOther: StatusCodeEnum.SeeOther,
  NotModified: StatusCodeEnum.NotModified,
  UseProxy: StatusCodeEnum.UseProxy,
  TemporaryRedirect: StatusCodeEnum.TemporaryRedirect,
  PermanentRedirect: StatusCodeEnum.PermanentRedirect,
  BadRequest: StatusCodeEnum.BadRequest,
  Unauthorized: StatusCodeEnum.Unauthorized,
  PaymentRequired: StatusCodeEnum.PaymentRequired,
  Forbidden: StatusCodeEnum.Forbidden,
  NotFound: StatusCodeEnum.NotFound,
  MethodNotAllowed: StatusCodeEnum.MethodNotAllowed,
  NotAcceptable: StatusCodeEnum.NotAcceptable,
  ProxyAuthenticationRequired: StatusCodeEnum.ProxyAuthenticationRequired,
  RequestTimeout: StatusCodeEnum.RequestTimeout,
  Conflict: StatusCodeEnum.Conflict,
  Gone: StatusCodeEnum.Gone,
  LengthRequired: StatusCodeEnum.LengthRequired,
  PreconditionFailed: StatusCodeEnum.PreconditionFailed,
  PayloadTooLarge: StatusCodeEnum.PayloadTooLarge,
  URITooLong: StatusCodeEnum.URITooLong,
  UnsupportedMediaType: StatusCodeEnum.UnsupportedMediaType,
  RangeNotSatisfiable: StatusCodeEnum.RangeNotSatisfiable,
  ExpectationFailed: StatusCodeEnum.ExpectationFailed,
  Imateapot: StatusCodeEnum.Imateapot,
  MisdirectedRequest: StatusCodeEnum.MisdirectedRequest,
  UnprocessableEntity: StatusCodeEnum.UnprocessableEntity,
  Locked: StatusCodeEnum.Locked,
  FailedDependency: StatusCodeEnum.FailedDependency,
  TooEarly: StatusCodeEnum.TooEarly,
  UpgradeRequired: StatusCodeEnum.UpgradeRequired,
  PreconditionRequired: StatusCodeEnum.PreconditionRequired,
  TooManyRequests: StatusCodeEnum.TooManyRequests,
  RequestHeaderFieldsTooLarge: StatusCodeEnum.RequestHeaderFieldsTooLarge,
  UnavailableForLegalReasons: StatusCodeEnum.UnavailableForLegalReasons,
  InternalServerError: StatusCodeEnum.InternalServerError,
  NotImplemented: StatusCodeEnum.NotImplemented,
  BadGateway: StatusCodeEnum.BadGateway,
  ServiceUnavailable: StatusCodeEnum.ServiceUnavailable,
  GatewayTimeout: StatusCodeEnum.GatewayTimeout,
  HTTPVersionNotSupported: StatusCodeEnum.HTTPVersionNotSupported,
  VariantAlsoNegotiates: StatusCodeEnum.VariantAlsoNegotiates,
  InsufficientStorage: StatusCodeEnum.InsufficientStorage,
  LoopDetected: StatusCodeEnum.LoopDetected,
  NotExtended: StatusCodeEnum.NotExtended,
  NetworkAuthenticationRequired: StatusCodeEnum.NetworkAuthenticationRequired,
};

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { StatusCode };