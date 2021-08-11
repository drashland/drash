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
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { IHandler } from "./IHandler.ts";
import { DrashRequest } from "../http/DrashRequest.ts";

/**
 * The HandlerProxy class is used to provide extra functionality to a Handler
 *
 *     class MyHandlerProxy extends HandlerProxy {
 *       public async handle(request: DrashRequest) {
 *         console.log("Before handling");
 *         const response = super.handle(request);
 *         console.log("After handling");
 *         return response;
 *       }
 *     }
 *
 * @class
 * @since 3.0.0
 */
export abstract class HandlerProxy implements IHandler {
  #original: IHandler;

  /**
   * @param {IHandler} original - The original Resource to add functionality
   *
   * @since 3.0.0
   */
  public constructor(original: IHandler) {
    this.#original = original;
  }

  public setNext(handler: IHandler) {
    return this.#original.setNext(handler);
  }

  public handle(request: DrashRequest) {
    return this.#original.handle(request);
  }
}
