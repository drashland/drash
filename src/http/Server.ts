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

import { HTTPOptions, HTTPSOptions, serve, serveTLS } from "../../deps.ts";
import { IHandler } from "../handlers/IHandler.ts";
import { Request } from "./Request.ts";
import { Response } from "./Response.ts";
import { HttpError } from "../domain/errors/HttpError.ts";

/**
 * The Server class for handling request/response for clients
 *
 * @class
 * @since 2.0.0
 */
export class Server {
  private handler?: IHandler;

  /**
   * Use this method for setting the initial handler for the server
   *
   * @param {IHandler} handler - Handler object to be used by the server
   * @since 2.0.0
   */
  public setHandler(handler: IHandler) {
    this.handler = handler;
  }

  /**
   * Start running the HTTP server
   *
   * @param {HTTPOptions} options - Options for listening on the HTTP server
   * @since 2.0.0
   */
  public async run(options: HTTPOptions) {
    const server = serve(options);
    for await (const request of server) {
      if (!this.handler) {
        const response = this.handleError(new HttpError(500));
        request.respond(response);
      } else {
        try {
          const response = await this.handler.handle(<Request>request);
          request.respond(response);
        } catch (error) {
          const response = this.handleError(error);
          request.respond(response);
        }
      }
    }
  }

  /**
   * Start running the HTTPS server
   *
   * @param {HTTPSOptions} options - Options for listening on the HTTPS server
   * @since 2.0.0
   */
  public async runTLS(options: HTTPSOptions) {
    const server = serveTLS(options);
    for await (const request of server) {
      if (!this.handler) {
        const response = this.handleError(new HttpError(500));
        request.respond(response);
      } else {
        try {
          const response = await this.handler.handle(<Request>request);
          request.respond(response);
        } catch (error) {
          const response = this.handleError(error);
          request.respond(response);
        }
      }
    }
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
