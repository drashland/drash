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

import { HandlerProxy } from "../HandlerProxy.ts";
import { DrashRequest } from "../../http/DrashRequest.ts";
import { HttpError } from "../../domain/errors/HttpError.ts";

export class AcceptHandlerProxy extends HandlerProxy {
  public override async handle(request: DrashRequest) {
    const accept = request.headers.get("Accept") ||
      request.headers.get("accept");
    if (!accept) {
      return super.handle(request);
    }
    // We await for our original object to handle a response
    const response = await super.handle(request);
    const contentType = response.headers.get("Content-Type");
    if (!contentType) {
      // No Content-Type added, so we error
      throw new HttpError(406);
    }
    if (accept.includes(contentType) === false) {
      // Content-Type is defined but doesn't have what user wants
      throw new HttpError(406);
    }
    return response;
  }
}
