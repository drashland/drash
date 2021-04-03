import { ServerRequest } from "https://deno.land/std@0.92.0/http/server.ts";

export { Rhum } from "https://deno.land/x/rhum@v1.1.9/mod.ts";

// deno-lint-ignore no-explicit-any
export const mockRequest = (url = "/", method = "get"): any => {
  // deno-lint-ignore no-explicit-any
  const request: any = new ServerRequest();
  request.url = url;
  request.method = method;
  request.headers = new Headers();
  return request;
};
