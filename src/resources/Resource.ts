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
import { Response } from "../http/Response.ts";
import { IResource } from "./IResource.ts";
import { HttpError } from "../domain/errors/HttpError.ts";

/**
 * The Resource class is used to create a resource object
 *
 *     class Home extends Resource {
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
export class Resource implements IResource {
  /**
   * A property to hold the list of uri where a resource can be found
   *
   * @since 2.0.0
   */
  public uri: string[] = [];

  public CONNECT(_request: Request) {
    const response = this.handleError(new HttpError(405));
    return new Promise<Response>(function (resolve) {
      resolve(response);
    });
  }

  public DELETE(_request: Request) {
    const response = this.handleError(new HttpError(405));
    return new Promise<Response>(function (resolve) {
      resolve(response);
    });
  }

  public GET(_request: Request) {
    const response = this.handleError(new HttpError(405));
    return new Promise<Response>(function (resolve) {
      resolve(response);
    });
  }

  public HEAD(_request: Request) {
    const response = this.handleError(new HttpError(405));
    return new Promise<Response>(function (resolve) {
      resolve(response);
    });
  }

  public OPTIONS(_request: Request) {
    const response = this.handleError(new HttpError(405));
    return new Promise<Response>(function (resolve) {
      resolve(response);
    });
  }

  public PATCH(_request: Request) {
    const response = this.handleError(new HttpError(405));
    return new Promise<Response>(function (resolve) {
      resolve(response);
    });
  }

  public POST(_request: Request) {
    const response = this.handleError(new HttpError(405));
    return new Promise<Response>(function (resolve) {
      resolve(response);
    });
  }

  public PUT(_request: Request) {
    const response = this.handleError(new HttpError(405));
    return new Promise<Response>(function (resolve) {
      resolve(response);
    });
  }

  public TRACE(_request: Request) {
    const response = this.handleError(new HttpError(405));
    return new Promise<Response>(function (resolve) {
      resolve(response);
    });
  }

  private handleError(error: HttpError | Error) {
    const response = new Response();
    if (error instanceof HttpError) {
      response.status = error["status"];
    } else {
      response.status = 500;
    }
    response.body = error["message"];
    return response;
  }
}
