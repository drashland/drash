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
import { StatusCode } from "../../../core/http/response/StatusCode.ts";
import { StatusDescription } from "../../../core/http/response/StatusDescription.ts";

const StatusByCode: Record<
  number,
  { Code: StatusCode; Description: StatusDescription }
> = {
  [StatusCode.Continue]: {
    Code: StatusCode.Continue,
    Description: StatusDescription.Continue,
  },
  [StatusCode.SwitchingProtocols]: {
    Code: StatusCode.SwitchingProtocols,
    Description: StatusDescription.SwitchingProtocols,
  },
  [StatusCode.Processing]: {
    Code: StatusCode.Processing,
    Description: StatusDescription.Processing,
  },
  [StatusCode.EarlyHints]: {
    Code: StatusCode.EarlyHints,
    Description: StatusDescription.EarlyHints,
  },
  [StatusCode.OK]: {
    Code: StatusCode.OK,
    Description: StatusDescription.OK,
  },
  [StatusCode.Created]: {
    Code: StatusCode.Created,
    Description: StatusDescription.Created,
  },
  [StatusCode.Accepted]: {
    Code: StatusCode.Accepted,
    Description: StatusDescription.Accepted,
  },
  [StatusCode.NonAuthoritativeInformation]: {
    Code: StatusCode.NonAuthoritativeInformation,
    Description: StatusDescription.NonAuthoritativeInformation,
  },
  [StatusCode.NoContent]: {
    Code: StatusCode.NoContent,
    Description: StatusDescription.NoContent,
  },
  [StatusCode.ResetContent]: {
    Code: StatusCode.ResetContent,
    Description: StatusDescription.ResetContent,
  },
  [StatusCode.PartialContent]: {
    Code: StatusCode.PartialContent,
    Description: StatusDescription.PartialContent,
  },
  [StatusCode.MultiStatus]: {
    Code: StatusCode.MultiStatus,
    Description: StatusDescription.MultiStatus,
  },
  [StatusCode.AlreadyReported]: {
    Code: StatusCode.AlreadyReported,
    Description: StatusDescription.AlreadyReported,
  },
  [StatusCode.IMUsed]: {
    Code: StatusCode.IMUsed,
    Description: StatusDescription.IMUsed,
  },
  [StatusCode.MultipleChoices]: {
    Code: StatusCode.MultipleChoices,
    Description: StatusDescription.MultipleChoices,
  },
  [StatusCode.MovedPermanently]: {
    Code: StatusCode.MovedPermanently,
    Description: StatusDescription.MovedPermanently,
  },
  [StatusCode.Found]: {
    Code: StatusCode.Found,
    Description: StatusDescription.Found,
  },
  [StatusCode.SeeOther]: {
    Code: StatusCode.SeeOther,
    Description: StatusDescription.SeeOther,
  },
  [StatusCode.NotModified]: {
    Code: StatusCode.NotModified,
    Description: StatusDescription.NotModified,
  },
  [StatusCode.UseProxy]: {
    Code: StatusCode.UseProxy,
    Description: StatusDescription.UseProxy,
  },
  [StatusCode.TemporaryRedirect]: {
    Code: StatusCode.TemporaryRedirect,
    Description: StatusDescription.TemporaryRedirect,
  },
  [StatusCode.PermanentRedirect]: {
    Code: StatusCode.PermanentRedirect,
    Description: StatusDescription.PermanentRedirect,
  },
  [StatusCode.BadRequest]: {
    Code: StatusCode.BadRequest,
    Description: StatusDescription.BadRequest,
  },
  [StatusCode.Unauthorized]: {
    Code: StatusCode.Unauthorized,
    Description: StatusDescription.Unauthorized,
  },
  [StatusCode.PaymentRequired]: {
    Code: StatusCode.PaymentRequired,
    Description: StatusDescription.PaymentRequired,
  },
  [StatusCode.Forbidden]: {
    Code: StatusCode.Forbidden,
    Description: StatusDescription.Forbidden,
  },
  [StatusCode.NotFound]: {
    Code: StatusCode.NotFound,
    Description: StatusDescription.NotFound,
  },
  [StatusCode.MethodNotAllowed]: {
    Code: StatusCode.MethodNotAllowed,
    Description: StatusDescription.MethodNotAllowed,
  },
  [StatusCode.NotAcceptable]: {
    Code: StatusCode.NotAcceptable,
    Description: StatusDescription.NotAcceptable,
  },
  [StatusCode.ProxyAuthenticationRequired]: {
    Code: StatusCode.ProxyAuthenticationRequired,
    Description: StatusDescription.ProxyAuthenticationRequired,
  },
  [StatusCode.RequestTimeout]: {
    Code: StatusCode.RequestTimeout,
    Description: StatusDescription.RequestTimeout,
  },
  [StatusCode.Conflict]: {
    Code: StatusCode.Conflict,
    Description: StatusDescription.Conflict,
  },
  [StatusCode.Gone]: {
    Code: StatusCode.Gone,
    Description: StatusDescription.Gone,
  },
  [StatusCode.LengthRequired]: {
    Code: StatusCode.LengthRequired,
    Description: StatusDescription.LengthRequired,
  },
  [StatusCode.PreconditionFailed]: {
    Code: StatusCode.PreconditionFailed,
    Description: StatusDescription.PreconditionFailed,
  },
  [StatusCode.PayloadTooLarge]: {
    Code: StatusCode.PayloadTooLarge,
    Description: StatusDescription.PayloadTooLarge,
  },
  [StatusCode.URITooLong]: {
    Code: StatusCode.URITooLong,
    Description: StatusDescription.URITooLong,
  },
  [StatusCode.UnsupportedMediaType]: {
    Code: StatusCode.UnsupportedMediaType,
    Description: StatusDescription.UnsupportedMediaType,
  },
  [StatusCode.RangeNotSatisfiable]: {
    Code: StatusCode.RangeNotSatisfiable,
    Description: StatusDescription.RangeNotSatisfiable,
  },
  [StatusCode.ExpectationFailed]: {
    Code: StatusCode.ExpectationFailed,
    Description: StatusDescription.ExpectationFailed,
  },
  [StatusCode.Imateapot]: {
    Code: StatusCode.Imateapot,
    Description: StatusDescription.Imateapot,
  },
  [StatusCode.MisdirectedRequest]: {
    Code: StatusCode.MisdirectedRequest,
    Description: StatusDescription.MisdirectedRequest,
  },
  [StatusCode.UnprocessableEntity]: {
    Code: StatusCode.UnprocessableEntity,
    Description: StatusDescription.UnprocessableEntity,
  },
  [StatusCode.Locked]: {
    Code: StatusCode.Locked,
    Description: StatusDescription.Locked,
  },
  [StatusCode.FailedDependency]: {
    Code: StatusCode.FailedDependency,
    Description: StatusDescription.FailedDependency,
  },
  [StatusCode.TooEarly]: {
    Code: StatusCode.TooEarly,
    Description: StatusDescription.TooEarly,
  },
  [StatusCode.UpgradeRequired]: {
    Code: StatusCode.UpgradeRequired,
    Description: StatusDescription.UpgradeRequired,
  },
  [StatusCode.PreconditionRequired]: {
    Code: StatusCode.PreconditionRequired,
    Description: StatusDescription.PreconditionRequired,
  },
  [StatusCode.TooManyRequests]: {
    Code: StatusCode.TooManyRequests,
    Description: StatusDescription.TooManyRequests,
  },
  [StatusCode.RequestHeaderFieldsTooLarge]: {
    Code: StatusCode.RequestHeaderFieldsTooLarge,
    Description: StatusDescription.RequestHeaderFieldsTooLarge,
  },
  [StatusCode.UnavailableForLegalReasons]: {
    Code: StatusCode.UnavailableForLegalReasons,
    Description: StatusDescription.UnavailableForLegalReasons,
  },
  [StatusCode.InternalServerError]: {
    Code: StatusCode.InternalServerError,
    Description: StatusDescription.InternalServerError,
  },
  [StatusCode.NotImplemented]: {
    Code: StatusCode.NotImplemented,
    Description: StatusDescription.NotImplemented,
  },
  [StatusCode.BadGateway]: {
    Code: StatusCode.BadGateway,
    Description: StatusDescription.BadGateway,
  },
  [StatusCode.ServiceUnavailable]: {
    Code: StatusCode.ServiceUnavailable,
    Description: StatusDescription.ServiceUnavailable,
  },
  [StatusCode.GatewayTimeout]: {
    Code: StatusCode.GatewayTimeout,
    Description: StatusDescription.GatewayTimeout,
  },
  [StatusCode.HTTPVersionNotSupported]: {
    Code: StatusCode.HTTPVersionNotSupported,
    Description: StatusDescription.HTTPVersionNotSupported,
  },
  [StatusCode.VariantAlsoNegotiates]: {
    Code: StatusCode.VariantAlsoNegotiates,
    Description: StatusDescription.VariantAlsoNegotiates,
  },
  [StatusCode.InsufficientStorage]: {
    Code: StatusCode.InsufficientStorage,
    Description: StatusDescription.InsufficientStorage,
  },
  [StatusCode.LoopDetected]: {
    Code: StatusCode.LoopDetected,
    Description: StatusDescription.LoopDetected,
  },
  [StatusCode.NotExtended]: {
    Code: StatusCode.NotExtended,
    Description: StatusDescription.NotExtended,
  },
  [StatusCode.NetworkAuthenticationRequired]: {
    Code: StatusCode.NetworkAuthenticationRequired,
    Description: StatusDescription.NetworkAuthenticationRequired,
  },
};

// FILE MARKER - PUBLIC API ////////////////////////////////////////////////////

export { StatusByCode };
