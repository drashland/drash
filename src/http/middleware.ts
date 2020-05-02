import { Drash } from "../../mod.ts";

/**
 * @type MiddlewareFunction
 * @param request Contains the instance of the request.
 * @param server Contains the instance of the server.
 * @param response Contains the instance of the response.
 */
export type MiddlewareFunction =
  | ((request: any, response: Drash.Http.Response) => Promise<void>)
  | ((request: any, response: Drash.Http.Response) => void);

/**
 * @type MiddlewareType
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
export type MiddlewareType = {
  before_request?: MiddlewareFunction[];
  after_request?: MiddlewareFunction[];
};

/**
 * Executes the middleware
 *
 * @param middlewares Contains middlewares to be executed
 */
export function Middleware(middlewares: MiddlewareType) {
  return function (...args: any[]) {
    switch (args.length) {
      case 1:
        // Class decorator
        // @ts-ignore
        return ClassMiddleware(middlewares).apply(this, args);
      case 2:
        // Property decorator
        break;
      case 3:
        if (typeof args[2] == "number") {
          // Parameter decorator
          break;
        }
        // @ts-ignore
        return MethodMiddleware(middlewares).apply(this, args);
      default:
        throw new Error("Not a valid decorator");
    }
  };
}

/**
 * Executes the middleware function before or after the request at method level
 *
 * @param middlewares Contains all middleware to be run
 */
function MethodMiddleware(middlewares: MiddlewareType) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalFunction = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const { request, response } = Object.getOwnPropertyDescriptors(this);
      // Execute before_request Middleware if exist
      if (middlewares.before_request != null) {
        for (const middleware of middlewares.before_request) {
          await middleware(request.value, response.value);
        }
      }

      // Execute function
      const result = originalFunction.apply(this, args);

      // Execute after_request Middleware if exist
      if (middlewares.after_request != null) {
        for (const middleware of middlewares.after_request) {
          await middleware(request.value, result);
        }
      }
      return result;
    };

    return descriptor;
  };
}

/**
 * Executes the middleware function before or after the request at class level
 *
 * @param middlewares Contains all middleware to be run
 */
function ClassMiddleware(middlewares: MiddlewareType) {
  return function <T extends { new (...args: any[]): {} }>(constr: T) {
    return class extends constr {
      constructor(...args: any[]) {
        const request = args[0];
        const response = args[1];
        // Execute before_request Middleware if exist
        if (middlewares.before_request != null) {
          for (const middleware of middlewares.before_request) {
            middleware(request, response);
          }
        }
        super(...args);
        // Execute after_request Middleware if exist
        if (middlewares.after_request != null) {
          for (const middleware of middlewares.after_request) {
            middleware(request, response);
          }
        }
      }
    };
  };
}
