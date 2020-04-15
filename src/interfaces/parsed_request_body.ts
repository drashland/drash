/**
 * @memberof Drash.Interfaces
 * @interface ParsedRequestBody
 *
 * @description
 *     content_type: any|undefined
 *
 *         The Content-Type of the request body. For example, if the body is
 *         JSON, then the Content-Type should be application/json.
 *
 *     data: any|undefined
 *
 *         The data passed in the body of the request.
 */
export interface ParsedRequestBody {
  content_type: any | undefined;
  data: any | undefined;
}
