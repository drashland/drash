import { Request, Resource, Response } from "../mod.ts";

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

export const THttpMethodArray = [
  "CONNECT",
  "DELETE",
  "GET",
  "HEAD",
  "OPTIONS",
  "PATCH",
  "POST",
  "PUT",
  "TRACE",
];

export type BodyFile = {
  content: Uint8Array;
  size: number;
  type: string;
  filename: string;
};

export type HttpHeadersKeyValuePairs = Record<string, string>;

export type TResourcesAndPatterns = Map<number, {
  resource: Resource;
  patterns: URLPattern[];
}>;

export type THttpMethodHandler = (
  request: Request,
  response: Response,
) => Promise<void> | void;
