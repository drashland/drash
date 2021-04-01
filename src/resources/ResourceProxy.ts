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
import { IResource } from "./IResource.ts";

/**
 * The ResourceProxy class is used to provide extra functionality to a Resource
 *
 *     class Logger extends ResourceProxy{
 *       public async GET(request: Request) {
 *         console.log("Before handling");
 *         const response = await super.GET(request);
 *         console.log("After handling");
 *         return response;
 *       }
 *     }
 *
 *
 * @class
 * @since 2.0.0
 */
export abstract class ResourceProxy implements IResource {
  private original: IResource;

  /**
   * @param {IResource} original - The original Resource to add functionality
   *
   * @since 2.0.0
   */
  public constructor(original: IResource) {
    this.original = original;
  }

  public CONNECT(request: Request) {
    return this.original.CONNECT(request);
  }

  public DELETE(request: Request) {
    return this.original.DELETE(request);
  }

  public GET(request: Request) {
    return this.original.GET(request);
  }

  public HEAD(request: Request) {
    return this.original.HEAD(request);
  }

  public OPTIONS(request: Request) {
    return this.original.OPTIONS(request);
  }

  public PATCH(request: Request) {
    return this.original.PATCH(request);
  }

  public POST(request: Request) {
    return this.original.POST(request);
  }

  public PUT(request: Request) {
    return this.original.PUT(request);
  }

  public TRACE(request: Request) {
    return this.original.TRACE(request);
  }
}
