/**
 * The allowed types for an HTTP method on a resource.
 */
export type THttpMethod =
  | "CONNECT"
  | "DELETE"
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT"
  | "TRACE";

export type BodyFile = {
  content: Uint8Array;
  size: number;
  type: string;
  filename: string;
};

/**
 * See the following for redirection HTTP status codes:
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages
 */
export type HttpStatusRedirection =
  | 300
  | 301
  | 302
  | 303
  | 304
  | 305
  | 307
  | 308;

export type HttpHeadersKeyValuePairs = Record<string, string>;
