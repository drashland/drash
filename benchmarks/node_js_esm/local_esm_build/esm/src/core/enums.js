/**
 * Drash - A micro HTTP framework for JavaScript and TypeScript systems.
 * Copyright (C) 2022  Drash authors. The Drash authors are listed in the
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
export var Method;
(function (Method) {
  Method["CONNECT"] = "CONNECT";
  Method["DELETE"] = "DELETE";
  Method["GET"] = "GET";
  Method["HEAD"] = "HEAD";
  Method["OPTIONS"] = "OPTIONS";
  Method["PATCH"] = "PATCH";
  Method["POST"] = "POST";
  Method["PUT"] = "PUT";
  Method["TRACE"] = "TRACE";
})(Method || (Method = {}));
/**
 * @link This follows https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export var StatusCode;
(function (StatusCode) {
  // Informational
  StatusCode[StatusCode["Continue"] = 100] = "Continue";
  StatusCode[StatusCode["SwitchingProtocols"] = 101] = "SwitchingProtocols";
  StatusCode[StatusCode["Processing"] = 102] = "Processing";
  StatusCode[StatusCode["EarlyHints"] = 103] = "EarlyHints";
  // Successful
  StatusCode[StatusCode["OK"] = 200] = "OK";
  StatusCode[StatusCode["Created"] = 201] = "Created";
  StatusCode[StatusCode["Accepted"] = 202] = "Accepted";
  StatusCode[StatusCode["NonAuthoritativeInformation"] = 203] =
    "NonAuthoritativeInformation";
  StatusCode[StatusCode["NoContent"] = 204] = "NoContent";
  StatusCode[StatusCode["ResetContent"] = 205] = "ResetContent";
  StatusCode[StatusCode["PartialContent"] = 206] = "PartialContent";
  StatusCode[StatusCode["MultiStatus"] = 207] = "MultiStatus";
  StatusCode[StatusCode["AlreadyReported"] = 208] = "AlreadyReported";
  StatusCode[StatusCode["IMUsed"] = 226] = "IMUsed";
  // Redirection messages
  StatusCode[StatusCode["MultipleChoices"] = 300] = "MultipleChoices";
  StatusCode[StatusCode["MovedPermanently"] = 301] = "MovedPermanently";
  StatusCode[StatusCode["Found"] = 302] = "Found";
  StatusCode[StatusCode["SeeOther"] = 303] = "SeeOther";
  StatusCode[StatusCode["NotModified"] = 304] = "NotModified";
  StatusCode[StatusCode["UseProxy"] = 305] = "UseProxy";
  StatusCode[StatusCode["TemporaryRedirect"] = 307] = "TemporaryRedirect";
  StatusCode[StatusCode["PermanentRedirect"] = 308] = "PermanentRedirect";
  // Client error responses
  StatusCode[StatusCode["BadRequest"] = 400] = "BadRequest";
  StatusCode[StatusCode["Unauthorized"] = 401] = "Unauthorized";
  StatusCode[StatusCode["PaymentRequired"] = 402] = "PaymentRequired";
  StatusCode[StatusCode["Forbidden"] = 403] = "Forbidden";
  StatusCode[StatusCode["NotFound"] = 404] = "NotFound";
  StatusCode[StatusCode["MethodNotAllowed"] = 405] = "MethodNotAllowed";
  StatusCode[StatusCode["NotAcceptable"] = 406] = "NotAcceptable";
  StatusCode[StatusCode["ProxyAuthenticationRequired"] = 407] =
    "ProxyAuthenticationRequired";
  StatusCode[StatusCode["RequestTimeout"] = 408] = "RequestTimeout";
  StatusCode[StatusCode["Conflict"] = 409] = "Conflict";
  StatusCode[StatusCode["Gone"] = 410] = "Gone";
  StatusCode[StatusCode["LengthRequired"] = 411] = "LengthRequired";
  StatusCode[StatusCode["PreconditionFailed"] = 412] = "PreconditionFailed";
  StatusCode[StatusCode["PayloadTooLarge"] = 413] = "PayloadTooLarge";
  StatusCode[StatusCode["URITooLong"] = 414] = "URITooLong";
  StatusCode[StatusCode["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
  StatusCode[StatusCode["RangeNotSatisfiable"] = 416] = "RangeNotSatisfiable";
  StatusCode[StatusCode["ExpectationFailed"] = 417] = "ExpectationFailed";
  StatusCode[StatusCode["Imateapot"] = 418] = "Imateapot";
  StatusCode[StatusCode["MisdirectedRequest"] = 421] = "MisdirectedRequest";
  StatusCode[StatusCode["UnprocessableEntity"] = 422] = "UnprocessableEntity";
  StatusCode[StatusCode["Locked"] = 423] = "Locked";
  StatusCode[StatusCode["FailedDependency"] = 424] = "FailedDependency";
  StatusCode[StatusCode["TooEarly"] = 425] = "TooEarly";
  StatusCode[StatusCode["UpgradeRequired"] = 426] = "UpgradeRequired";
  StatusCode[StatusCode["PreconditionRequired"] = 428] = "PreconditionRequired";
  StatusCode[StatusCode["TooManyRequests"] = 429] = "TooManyRequests";
  StatusCode[StatusCode["RequestHeaderFieldsTooLarge"] = 431] =
    "RequestHeaderFieldsTooLarge";
  StatusCode[StatusCode["UnavailableForLegalReasons"] = 451] =
    "UnavailableForLegalReasons";
  // Server error responses
  StatusCode[StatusCode["InternalServerError"] = 500] = "InternalServerError";
  StatusCode[StatusCode["NotImplemented"] = 501] = "NotImplemented";
  StatusCode[StatusCode["BadGateway"] = 502] = "BadGateway";
  StatusCode[StatusCode["ServiceUnavailable"] = 503] = "ServiceUnavailable";
  StatusCode[StatusCode["GatewayTimeout"] = 504] = "GatewayTimeout";
  StatusCode[StatusCode["HTTPVersionNotSupported"] = 505] =
    "HTTPVersionNotSupported";
  StatusCode[StatusCode["VariantAlsoNegotiates"] = 506] =
    "VariantAlsoNegotiates";
  StatusCode[StatusCode["InsufficientStorage"] = 507] = "InsufficientStorage";
  StatusCode[StatusCode["LoopDetected"] = 508] = "LoopDetected";
  StatusCode[StatusCode["NotExtended"] = 510] = "NotExtended";
  StatusCode[StatusCode["NetworkAuthenticationRequired"] = 511] =
    "NetworkAuthenticationRequired";
})(StatusCode || (StatusCode = {}));
export var StatusCodeRedirection;
(function (StatusCodeRedirection) {
  StatusCodeRedirection[StatusCodeRedirection["MultipleChoices"] = 300] =
    "MultipleChoices";
  StatusCodeRedirection[StatusCodeRedirection["MovedPermanently"] = 301] =
    "MovedPermanently";
  StatusCodeRedirection[StatusCodeRedirection["Found"] = 302] = "Found";
  StatusCodeRedirection[StatusCodeRedirection["SeeOther"] = 303] = "SeeOther";
  StatusCodeRedirection[StatusCodeRedirection["NotModified"] = 304] =
    "NotModified";
  StatusCodeRedirection[StatusCodeRedirection["UseProxy"] = 305] = "UseProxy";
  StatusCodeRedirection[StatusCodeRedirection["TemporaryRedirect"] = 307] =
    "TemporaryRedirect";
  StatusCodeRedirection[StatusCodeRedirection["PermanentRedirect"] = 308] =
    "PermanentRedirect";
})(StatusCodeRedirection || (StatusCodeRedirection = {}));
//# sourceMappingURL=enums.js.map
