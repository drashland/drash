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

import { Status } from "../../../deps.ts";
import { IHandler } from "../IHandler.ts";
import { HandlerProxy } from "../HandlerProxy.ts";
import { Request } from "../../http/Request.ts";
import { Response } from "../../http/Response.ts";
import { HttpError } from "../../domain/errors/HttpError.ts";
import { MimeTypes } from "../../domain/entities/MimeTypes.ts";
import { IFileService } from "../../services/IFileService.ts";

export class FavIconHandlerProxy extends HandlerProxy {
  private fileService: IFileService;

  public constructor(original: IHandler, fileService: IFileService) {
    super(original);
    this.fileService = fileService;
  }

  public async handle(request: Request) {
    if (request.method.toUpperCase() !== "GET") {
      return super.handle(request);
    }
    const filenameExtension = this.fileService.getFilenameExtension(
      request.url,
    );
    if (filenameExtension !== "ico") {
      return super.handle(request);
    }

    const mimeType = MimeTypes.get(filenameExtension);
    if (!mimeType) {
      throw new HttpError(415);
    }

    const headers = new Headers();
    const response = new Response();
    response.headers = headers;

    try {
      response.body = await Deno.readFile(`${Deno.cwd()}${request.url}`);
      headers.set("Content-Type", mimeType);
      response.status = Status.OK;
    } catch (error) {
      throw new HttpError(404);
    }
    return response;
  }
}
