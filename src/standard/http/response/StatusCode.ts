import { StatusCode as StatusCodeEnum } from "../../../core/http/response/StatusCode.ts";

export const StatusCode: Record<keyof typeof StatusCodeEnum, StatusCodeEnum> = {
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
