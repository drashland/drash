import { HandlerBuilder } from "../builders/HandlerBuilder.ts";
import { Handler } from "../handlers/Handler.ts";
import { HandlerProxy } from "../handlers/HandlerProxy.ts";
import { IHandler } from "../handlers/IHandler.ts";

type HandlerConfig<T extends unknown[]> = Array<{
  class: new (...args: T) => Handler;
  args?: T;
  proxies: Array<{
    class: new (handler: IHandler, ...args: T) => HandlerProxy;
    args?: T;
  }>;
}>;

export function handlerFactory<T extends unknown[]>(configs: HandlerConfig<T>) {
  const handlers: IHandler[] = [];

  const builder = new HandlerBuilder();

  for (const handler of configs) {
    builder.setHandler(handler.class, ...handler.args!);
    for (const proxy of handler.proxies || []) {
      builder.setProxy(proxy.class, ...proxy.args!);
    }

    handlers.push(builder.handler);
  }

  const firstHandler = handlers.reduceRight(function (previous, current) {
    previous.setNext(current);
    return previous;
  });
  return firstHandler;
}
