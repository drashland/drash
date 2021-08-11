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

import { DrashRequest } from "../../http/DrashRequest.ts";
import { DrashResponse } from "../../http/DrashResponse.ts";
import { ControllerProxy } from "../ControllerProxy.ts";
import { HttpError } from "../../domain/errors/HttpError.ts";
import { IContentNegotiationService } from "../../services/IContentNegotiationService.ts";
import { IController } from "../IController.ts";

export class AcceptControllerProxy extends ControllerProxy {
  #contentNegotiationService: IContentNegotiationService;

  public constructor(
    original: IController,
    contentNegotiationService: IContentNegotiationService,
  ) {
    super(original);
    this.#contentNegotiationService = contentNegotiationService;
  }

  public override CONNECT(request: DrashRequest) {
    return this.execute(request, super.CONNECT(request));
  }

  public override DELETE(request: DrashRequest) {
    return this.execute(request, super.CONNECT(request));
  }

  public override GET(request: DrashRequest) {
    return this.execute(request, super.CONNECT(request));
  }

  public override HEAD(request: DrashRequest) {
    return this.execute(request, super.CONNECT(request));
  }

  public override OPTIONS(request: DrashRequest) {
    return this.execute(request, super.CONNECT(request));
  }

  public override PATCH(request: DrashRequest) {
    return this.execute(request, super.CONNECT(request));
  }

  public override POST(request: DrashRequest) {
    return this.execute(request, super.CONNECT(request));
  }

  public override PUT(request: DrashRequest) {
    return this.execute(request, super.CONNECT(request));
  }

  public override TRACE(request: DrashRequest) {
    return this.execute(request, super.CONNECT(request));
  }

  private async execute(
    request: DrashRequest,
    responsePromise: Promise<DrashResponse>,
  ) {
    const response = await responsePromise;
    if (
      this.#contentNegotiationService.isValidContentNegotiation(
        request,
        response,
      ) === false
    ) {
      throw new HttpError(406);
    }
    return response;
  }
}
