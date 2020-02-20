/**
 * @memberof Drash.Interfaces
 * @interface ParsedRequestBody
 *
 * @description
 *     content_type: The Content-Type of the request body. For example, if the
 *     body is JSON, then the Content-Type should be application/json.
 *
 *     data: The data passed in the body of the request.
 */
export interface ParsedRequestBody {
  content_type: any|undefined;
  data: any|undefined;
}

