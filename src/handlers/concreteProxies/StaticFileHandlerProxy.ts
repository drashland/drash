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

import { IHandler } from "../IHandler.ts";
import { HandlerProxy } from "../HandlerProxy.ts";
import { IFileService } from "../../services/IFileService.ts";
import { Request } from "../../http/Request.ts";
import { Response } from "../../http/Response.ts";
import { Status } from "../../../deps.ts";
import { MimeTypes } from "../../domain/entities/MimeTypes.ts";
import { HttpError } from "../../domain/errors/HttpError.ts";

export class StaticFileHandlerProxy extends HandlerProxy {
  private fileService: IFileService;
  private uri: string;
  private staticDirectory: string;

  public constructor(
    original: IHandler,
    fileService: IFileService,
    uri: string,
    staticDirectory: string,
  ) {
    super(original);
    this.fileService = fileService;
    this.uri = uri;
    this.staticDirectory = staticDirectory;
  }

  public async handle(request: Request) {
    if (request.url.startsWith(this.uri) === false) {
      // We cannot statictly serve this request
      return super.handle(request);
    }
    const response = new Response();
    response.headers = new Headers();

    try {
      const prettyUri = this.prettyUri(request.url);
      response.body = await Deno.readFile(
        `${this.staticDirectory}/${prettyUri}`,
      );
      response.status = Status.OK;
      const mimeType = MimeTypes.get(
        this.fileService.getFilenameExtension(prettyUri),
      );
      if (!mimeType) {
        throw new HttpError(415);
      }
      response.headers.set("Content-Type", mimeType);
    } catch (error) {
      throw new HttpError(404);
    }
    return response;
  }

  private prettyUri(uri: string) {
    if (uri.endsWith("/")) {
      // If it ends with a /, append index.html
      uri = `${uri}index.html`;
    }
    if (uri.startsWith("/")) {
      // Remove / if it starts with it
      uri = uri.substring(1);
    }

    if (this.fileService.getFilenameExtension(uri) === "") {
      // No extention? Default to .html
      return `${uri}.html`;
    }
    return uri;
  }
}
