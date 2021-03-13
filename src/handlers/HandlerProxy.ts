import { IHandler } from "./IHandler.ts";
import { Request } from "../http/Request.ts";

export class HandlerProxy implements IHandler {
  private original: IHandler;

  public constructor(original: IHandler) {
    this.original = original;
  }

  public setNext(handler: IHandler) {
    return this.original.setNext(handler);
  }

  public handle(request: Request) {
    return this.original.handle(request);
  }
}
