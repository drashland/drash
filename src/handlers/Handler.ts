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

import { Request } from "../http/Request.ts";
import { IHandler } from "./IHandler.ts";
import { HttpError } from "../domain/errors/HttpError.ts";

/**
 * The Handler class is used to create a handler object
 *
 *     class MyHandler extends Handler {
 *       public uri = ["/user", "/users"]
 *       public async GET(request: Request) {
 *         const response = new Response();
 *         response.body = "hello world";
 *         response.status = 200;
 *         return response;
 *       }
 *     }
 *
 * @class
 * @since 2.0.0
 */
export class Handler implements IHandler {
  private nextHandler?: IHandler;

  /**
   * Use this method to create a chain of handlers
   *     const handler1 = new (...);
   *     const handler2 = new (...);
   *     const handler3 = new (...);
   *     const lastHandler = handler1.setNext(handler2).setNext(handler3);
   *
   * @param {IHandler} handler - Handler object to be appended to the chain
   * @returns {IHandler} The last handler from the chaing
   * @since 2.0.0
   */
  public setNext(handler: IHandler): IHandler {
    this.nextHandler = handler;
    return handler;
  }

  /**
   * Use this method to handle an incoming request
   *
   * @param {Request} request - Request to be handled
   * @returns {Promise<Response>} The last handler from the chaing
   * @since 2.0.0
   */
  public handle(request: Request) {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    throw new HttpError(404);
  }
}
