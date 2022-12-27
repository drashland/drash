import { Handler } from "../Interfaces.ts";

export class HandlerBuilder {
  #handler?: Handler;

  public constructor() {
    this.#reset();
  }

  public setHandler<T extends unknown[]>(
    handler: new (...args: T) => Handler,
    ...args: T
  ) {
    this.#reset();
    this.#handler = new handler(...args);
    return this;
  }

  /**
   * @returns {IHandler} The built handler
   * @since 3.0.0
   */
  public get handler(): Handler {
    if (this.#handler == null) {
      throw new Error("You cannot get a non existing handler");
    }
    const handler = this.#handler;
    this.#reset();
    return handler;
  }

  #reset() {
    this.#handler = undefined;
  }
}
