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
import { IContentNegotiationService } from "../IContentNegotiationService.ts";

export class ContentNegotiationService implements IContentNegotiationService {
  public isValidContentNegotiation(
    request: DrashRequest,
    response: DrashResponse,
  ) {
    const accept = request.headers.get("Accept") ||
      request.headers.get("accept");
    if (accept == null) {
      // Client doesn't care about content negotiation
      return true;
    }
    const contentType = response.headers.get("content-type");
    if (contentType == null) {
      // No Content-Type added
      return false;
    }
    if (accept.includes(contentType) === false) {
      // Content-Type is defined but doesn't have what user wants
      return false;
    }
    return true;
  }
}
