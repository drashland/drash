/**
 * Contains the type of ParsedRequestBody
 * @remarks
 * content_type: any|undefined
 *
 *     The Content-Type of the request body. For example, if the body is
 *     JSON, then the Content-Type should be application/json.
 *
 * data: any|undefined
 *
 *     The data passed in the body of the request.
 */
import { MultipartFormData } from "../../deps.ts";

interface KeyValuePairs {
  [key: string]: unknown;
}

export interface ParsedRequestBody {
  content_type: string;
  data: undefined | MultipartFormData | KeyValuePairs;
}
