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
import { StatusCode as StatusCodeEnum } from "../../../core/http/response/StatusCode.ts";
import { StatusDescription as StatusDescriptionEnum } from "../../../core/http/response/StatusDescription.ts";

const StatusDescription: Record<
  keyof typeof StatusCodeEnum,
  StatusDescriptionEnum
> = {
  Continue: StatusDescriptionEnum.Continue,
  SwitchingProtocols: StatusDescriptionEnum.SwitchingProtocols,
  Processing: StatusDescriptionEnum.Processing,
  EarlyHints: StatusDescriptionEnum.EarlyHints,
  OK: StatusDescriptionEnum.OK,
  Created: StatusDescriptionEnum.Created,
  Accepted: StatusDescriptionEnum.Accepted,
  NonAuthoritativeInformation:
    StatusDescriptionEnum.NonAuthoritativeInformation,
  NoContent: StatusDescriptionEnum.NoContent,
  ResetContent: StatusDescriptionEnum.ResetContent,
  PartialContent: StatusDescriptionEnum.PartialContent,
  MultiStatus: StatusDescriptionEnum.MultiStatus,
  AlreadyReported: StatusDescriptionEnum.AlreadyReported,
  IMUsed: StatusDescriptionEnum.IMUsed,
  MultipleChoices: StatusDescriptionEnum.MultipleChoices,
  MovedPermanently: StatusDescriptionEnum.MovedPermanently,
  Found: StatusDescriptionEnum.Found,
  SeeOther: StatusDescriptionEnum.SeeOther,
  NotModified: StatusDescriptionEnum.NotModified,
  UseProxy: StatusDescriptionEnum.UseProxy,
  TemporaryRedirect: StatusDescriptionEnum.TemporaryRedirect,
  PermanentRedirect: StatusDescriptionEnum.PermanentRedirect,
  BadRequest: StatusDescriptionEnum.BadRequest,
  Unauthorized: StatusDescriptionEnum.Unauthorized,
  PaymentRequired: StatusDescriptionEnum.PaymentRequired,
  Forbidden: StatusDescriptionEnum.Forbidden,
  NotFound: StatusDescriptionEnum.NotFound,
  MethodNotAllowed: StatusDescriptionEnum.MethodNotAllowed,
  NotAcceptable: StatusDescriptionEnum.NotAcceptable,
  ProxyAuthenticationRequired:
    StatusDescriptionEnum.ProxyAuthenticationRequired,
  RequestTimeout: StatusDescriptionEnum.RequestTimeout,
  Conflict: StatusDescriptionEnum.Conflict,
  Gone: StatusDescriptionEnum.Gone,
  LengthRequired: StatusDescriptionEnum.LengthRequired,
  PreconditionFailed: StatusDescriptionEnum.PreconditionFailed,
  PayloadTooLarge: StatusDescriptionEnum.PayloadTooLarge,
  URITooLong: StatusDescriptionEnum.URITooLong,
  UnsupportedMediaType: StatusDescriptionEnum.UnsupportedMediaType,
  RangeNotSatisfiable: StatusDescriptionEnum.RangeNotSatisfiable,
  ExpectationFailed: StatusDescriptionEnum.ExpectationFailed,
  Imateapot: StatusDescriptionEnum.Imateapot,
  MisdirectedRequest: StatusDescriptionEnum.MisdirectedRequest,
  UnprocessableEntity: StatusDescriptionEnum.UnprocessableEntity,
  Locked: StatusDescriptionEnum.Locked,
  FailedDependency: StatusDescriptionEnum.FailedDependency,
  TooEarly: StatusDescriptionEnum.TooEarly,
  UpgradeRequired: StatusDescriptionEnum.UpgradeRequired,
  PreconditionRequired: StatusDescriptionEnum.PreconditionRequired,
  TooManyRequests: StatusDescriptionEnum.TooManyRequests,
  RequestHeaderFieldsTooLarge:
    StatusDescriptionEnum.RequestHeaderFieldsTooLarge,
  UnavailableForLegalReasons: StatusDescriptionEnum.UnavailableForLegalReasons,
  InternalServerError: StatusDescriptionEnum.InternalServerError,
  NotImplemented: StatusDescriptionEnum.NotImplemented,
  BadGateway: StatusDescriptionEnum.BadGateway,
  ServiceUnavailable: StatusDescriptionEnum.ServiceUnavailable,
  GatewayTimeout: StatusDescriptionEnum.GatewayTimeout,
  HTTPVersionNotSupported: StatusDescriptionEnum.HTTPVersionNotSupported,
  VariantAlsoNegotiates: StatusDescriptionEnum.VariantAlsoNegotiates,
  InsufficientStorage: StatusDescriptionEnum.InsufficientStorage,
  LoopDetected: StatusDescriptionEnum.LoopDetected,
  NotExtended: StatusDescriptionEnum.NotExtended,
  NetworkAuthenticationRequired:
    StatusDescriptionEnum.NetworkAuthenticationRequired,
};

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { StatusDescription };
