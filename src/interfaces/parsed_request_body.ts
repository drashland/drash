/// Member: Drash.Interfaces.ParsedRequestBody

import type { MultipartFormData } from "../../deps.ts";

interface KeyValuePairs {
  [key: string]: unknown;
}

/**
 * Contains the type of ParsedRequestBody.
 *
 * content_type
 *
 *     The Content-Type of the request body. For example, if the body is JSON,
 *     then the Content-Type should be application/json.
 *
 * data
 *
 *     The data passed in the body of the request.
 */
export interface ParsedRequestBody {
  content_type: string;
  data: undefined | MultipartFormData | KeyValuePairs;
}
