import { Drash } from "../../mod.ts";

/**
 * @type MiddlewareFunction
 * @param request Contains the instance of the request.
 * @param server Contains the instance of the server.
 * @param response Contains the instance of the response.
 */
export type MiddlewareFunction = (request: any, server: Drash.Http.Server, response: Drash.Http.Response) => void;

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
 * Executes the middleware function before or after the request
 *
 * @param middlewares Contains all middleware to be run
 */
export function MiddlewareHandler(middlewares: MiddlewareType) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            // Fetch function context
            const { request, server, response } = Object.getOwnPropertyDescriptors(this);

            // Execute before_request Middleware if exist
            if (middlewares.before_request != null) {
                try {
                    for (const fn of middlewares.before_request) {
                        fn(request.value, server.value, response.value);
                    }
                } catch (error) {
                    throw error;
                }
            }
            // Execute original function
            const result = originalMethod.apply(this, args);

            // Execute after_request Middleware if exist
            if (middlewares.after_request != null) {
                try {
                    for (const fn of middlewares.after_request) {
                        fn(request.value, server.value, response.value);
                    }
                } catch (error) {
                    throw error;
                }
            }
            return result;
        };
    };
}
