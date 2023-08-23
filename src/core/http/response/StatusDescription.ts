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

export enum StatusDescription {
  Continue = "Continue",
  SwitchingProtocols = "Switching Protocols",
  Processing = "Processing",
  EarlyHints = "Early Hints",
  OK = "OK",
  Created = "Created",
  Accepted = "Accepted",
  NonAuthoritativeInformation = "Non-Authoritative Information",
  NoContent = "No Content",
  ResetContent = "Reset Content",
  PartialContent = "Partial Content",
  MultiStatus = "Multi Status",
  AlreadyReported = "Already Reported",
  IMUsed = "IM Used",
  MultipleChoices = "Multiple Choices",
  MovedPermanently = "Moved Permanently",
  Found = "Found",
  SeeOther = "See Other",
  NotModified = "Not Modified",
  UseProxy = "Use Proxy",
  TemporaryRedirect = "Temporary Redirect",
  PermanentRedirect = "Permanent Redirect",
  BadRequest = "Bad Request",
  Unauthorized = "Unauthorized",
  PaymentRequired = "Payment Required",
  Forbidden = "Forbidden",
  NotFound = "Not Found",
  MethodNotAllowed = "Method Not Allowed",
  NotAcceptable = "Not Acceptable",
  ProxyAuthenticationRequired = "Proxy Auth Required",
  RequestTimeout = "Request Timeout",
  Conflict = "Conflict",
  Gone = "Gone",
  LengthRequired = "Length Required",
  PreconditionFailed = "Precondition Failed",
  PayloadTooLarge = "Request Entity Too Large",
  URITooLong = "Request URI Too Long",
  UnsupportedMediaType = "Unsupported Media Type",
  RangeNotSatisfiable = "Requested Range Not Satisfiable",
  ExpectationFailed = "Expectation Failed",
  Imateapot = "I'm a teapot",
  MisdirectedRequest = "Misdirected Request",
  UnprocessableEntity = "Unprocessable Entity",
  Locked = "Locked",
  FailedDependency = "Failed Dependency",
  TooEarly = "Too Early",
  UpgradeRequired = "Upgrade Required",
  PreconditionRequired = "Precondition Required",
  TooManyRequests = "Too Many Requests",
  RequestHeaderFieldsTooLarge = "Request Header Fields Too Large",
  UnavailableForLegalReasons = "Unavailable For Legal Reasons",
  InternalServerError = "Internal Server Error",
  NotImplemented = "Not Implemented",
  BadGateway = "Bad Gateway",
  ServiceUnavailable = "Service Unavailable",
  GatewayTimeout = "Gateway Timeout",
  HTTPVersionNotSupported = "HTTP Version Not Supported",
  VariantAlsoNegotiates = "Variant Also Negotiates",
  InsufficientStorage = "Insufficient Storage",
  LoopDetected = "Loop Detected",
  NotExtended = "Not Extended",
  NetworkAuthenticationRequired = "Network Authentication Required",
}
