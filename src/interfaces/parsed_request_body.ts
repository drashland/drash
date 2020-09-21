import type { MultipartFormData } from "../../deps.ts";

interface KeyValuePairs {
  [key: string]: unknown;
}

/**
 * Contains the type of ParsedRequestBody
 * @remarks
 * content_type: string
 *
 *     The Content-Type of the request body. For example, if the body is
 *     JSON, then the Content-Type should be application/json.
 *
 * data: undefined|MultipartFormData|KeyValuePairs
 *
 *     The data passed in the body of the request.
 */
export interface ParsedRequestBody {
  content_type: string;
  data: undefined | MultipartFormData | KeyValuePairs;
}
