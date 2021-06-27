import type { Request } from "./http/request.ts";
import type { Response } from "./http/response.ts";
/**
 * @param request - Contains the instance of the request.
 * @param server - Contains the instance of the server.
 * @param response - Contains the instance of the response.
 */
export type MiddlewareFunction =
  | ((
    request: Request,
    response: Response,
  ) => Promise<void>)
  | ((request: Request, response: Response) => void);

/**
 * @description
 *     before_request?: MiddlewareFunction[]
 *
 *         An array that contains all the functions that will be run before a Drash.Http.Request is handled.
 *
 *     after_request: MiddlewareFunction[]
 *
 *         An array that contains all the functions that will be run after a Drash.Http.Request is handled.
 *
 */
export type Middleware = {
  before_request?: MiddlewareFunction[];
  after_request?: MiddlewareFunction[];
};
