/**
 * The allowed types for an HTTP method on a resource.
 */
export type HttpMethodName =
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

export type HttpHeadersKeyValuePairs = Record<string, string>;
