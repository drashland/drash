import { Drash } from "../../mod.ts";

/**
 * Executes the middleware function before or after the request at method level
 *
 * @param middlewares Contains all middleware to be run
 */
export function HttpMethodMiddleware(middlewares: any) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: any
  ) {
    if (descriptor === undefined) {
      descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    }
    const resourceHttpMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {

      // Execute middleware before the request
      if (this.server.middleware.resource_level) {
        middlewares.forEach((middleware: string) => {
          let mc = this.server.middleware.resource_level[middleware];
          if (mc) {
            let m = new mc(this.request, this.server, this);
            m.run();
          }
        });
      }

      // Execute the HTTP method
      const result = resourceHttpMethod.apply(this, args);

      // Execute middleware after the request
      if (this.server.middleware.resource_level) {
        middlewares.forEach((middleware: string) => {
          let mc = this.server.middleware.resource_level[middleware];
          if (mc) {
            let m = new mc(this.request, this.server, this, this.response);
            m.run();
          }
        });
      }

      return result;
    };

    return descriptor;
  };
}
