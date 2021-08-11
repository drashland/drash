/*
 * MIT License
 *
 * Copyright (c) 2019-2021 Drash Land
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { ConfigError } from "../domain/errors/ConfigError.ts";
import { Handler } from "../handlers/Handler.ts";
import { HandlerProxy } from "../handlers/HandlerProxy.ts";
import { IHandler } from "../handlers/IHandler.ts";

/**
 *
 * The HandlerBuilder class for handling the creation of resources
 *
 * @since 3.0.0
 */
export class HandlerBuilder {
  #handler?: IHandler;

  public constructor() {
    this.reset();
  }

  public setHandler<T extends unknown[]>(
    handler: new (...args: T) => Handler,
    ...args: T
  ) {
    this.reset();
    this.#handler = new handler(...args);
    this.setNativeProxies();
    return this;
  }

  public setProxy<T extends unknown[]>(
    proxy: new (handler: IHandler, ...args: T) => HandlerProxy,
    ...args: T
  ) {
    if (this.#handler == null) {
      throw new ConfigError(
        "You cannot set a proxy of a non existing handler",
      );
    }
    this.#handler = new proxy(this.#handler!, ...args);
    return this;
  }

  /**
   * @returns {IHandler} The built handler
   * @since 3.0.0
   */
  public get handler(): IHandler {
    if (this.#handler == null) {
      throw new ConfigError("You cannot get a non existing handler");
    }
    const handler = this.#handler!;
    this.reset();
    return handler;
  }

  private reset() {
    this.#handler = undefined;
  }

  private setNativeProxies<T extends unknown[]>() {
    const nativeProxies: Array<
      {
        class: new (handler: IHandler, ...args: T) => HandlerProxy;
        args?: T;
      }
    > = [];
    for (const proxy of nativeProxies) {
      this.setProxy(proxy.class, ...proxy.args!);
    }
  }
}
