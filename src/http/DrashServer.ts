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
import { STATUS_TEXT } from "../../deps.ts";
import { HttpError } from "../domain/errors/HttpError.ts";
import { IHandler } from "../handlers/IHandler.ts";
import { DrashRequest } from "./DrashRequest.ts";
import { DrashResponse } from "./DrashResponse.ts";

/**
 * The Server class for handling request/response for clients
 *
 * @class
 * @since 3.0.0
 */
export class DrashServer {
  #listener: Deno.Listener;

  public constructor(listener: Deno.Listener) {
    this.#listener = listener;
  }

  /**
   * Start the DrashServer.
   *
   * @param {IHandler} handler - The handler to be use in the server
   * @since 3.0.0
   */
  public async run(handler: IHandler) {
    for await (const conn of this.#listener) {
      this.handle(conn, handler);
    }
  }

  private async handle(conn: Deno.Conn, handler: IHandler) {
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
      try {
        const request = new DrashRequest(requestEvent.request);
        const response = await handler.handle(request);
        await requestEvent.respondWith(
          DrashResponse.generateResponse(response),
        );
      } catch (error) {
        const response = new DrashResponse();
        response.body = error["message"];
        if (error instanceof HttpError) {
          response.status = error.status;
        }

        // @ts-ignore: This is flagged as possibly undefined, even though it definitly exists
        response.statusText = STATUS_TEXT.get(response.status || 500);
        await requestEvent.respondWith(
          DrashResponse.generateResponse(response)
        )
      }
    }
  }
}
