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

export const StatusName = {
  Continue: "Continue",
  SwitchingProtocols: "SwitchingProtocols",
  Processing: "Processing",
  EarlyHints: "EarlyHints",
  OK: "OK",
  Created: "Created",
  Accepted: "Accepted",
  NonAuthoritativeInformation: "NonAuthoritativeInformation",
  NoContent: "NoContent",
  ResetContent: "ResetContent",
  PartialContent: "PartialContent",
  MultiStatus: "MultiStatus",
  AlreadyReported: "AlreadyReported",
  IMUsed: "IMUsed",
  MultipleChoices: "MultipleChoices",
  MovedPermanently: "MovedPermanently",
  Found: "Found",
  SeeOther: "SeeOther",
  NotModified: "NotModified",
  UseProxy: "UseProxy",
  TemporaryRedirect: "TemporaryRedirect",
  PermanentRedirect: "PermanentRedirect",
  BadRequest: "BadRequest",
  Unauthorized: "Unauthorized",
  PaymentRequired: "PaymentRequired",
  Forbidden: "Forbidden",
  NotFound: "NotFound",
  MethodNotAllowed: "MethodNotAllowed",
  NotAcceptable: "NotAcceptable",
  ProxyAuthenticationRequired: "ProxyAuthenticationRequired",
  RequestTimeout: "RequestTimeout",
  Conflict: "Conflict",
  Gone: "Gone",
  LengthRequired: "LengthRequired",
  PreconditionFailed: "PreconditionFailed",
  PayloadTooLarge: "PayloadTooLarge",
  URITooLong: "URITooLong",
  UnsupportedMediaType: "UnsupportedMediaType",
  RangeNotSatisfiable: "RangeNotSatisfiable",
  ExpectationFailed: "ExpectationFailed",
  Imateapot: "Imateapot",
  MisdirectedRequest: "MisdirectedRequest",
  UnprocessableEntity: "UnprocessableEntity",
  Locked: "Locked",
  FailedDependency: "FailedDependency",
  TooEarly: "TooEarly",
  UpgradeRequired: "UpgradeRequired",
  PreconditionRequired: "PreconditionRequired",
  TooManyRequests: "TooManyRequests",
  RequestHeaderFieldsTooLarge: "RequestHeaderFieldsTooLarge",
  UnavailableForLegalReasons: "UnavailableForLegalReasons",
  InternalServerError: "InternalServerError",
  NotImplemented: "NotImplemented",
  BadGateway: "BadGateway",
  ServiceUnavailable: "ServiceUnavailable",
  GatewayTimeout: "GatewayTimeout",
  HTTPVersionNotSupported: "HTTPVersionNotSupported",
  VariantAlsoNegotiates: "VariantAlsoNegotiates",
  InsufficientStorage: "InsufficientStorage",
  LoopDetected: "LoopDetected",
  NotExtended: "NotExtended",
  NetworkAuthenticationRequired: "NetworkAuthenticationRequired",
} as const;
