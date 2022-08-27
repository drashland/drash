import { Request, Resource, Response } from "../mod.ts";

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

export type ResourcesAndPatternsMap = Map<number, {
  resource: Resource;
  patterns: URLPattern[];
}>;

export type ResourceHttpMethodHandler = (
  request: Request,
  response: Response,
) => Promise<void> | void;

/**
 * Request options to use when creating the `Drash.Server` object.
 *
 * @example
 *
 * ```typescript
 * const server = new Drash.Server({
 *   ...
 *   ...
 *   ...
 *   request: {
 *     read_body: false,
 *   }
 * });
 * ```
 */
export type RequestOptions = Partial<{
  /** Should incoming requests have their bodies read? */
  read_body: boolean;
}>;
