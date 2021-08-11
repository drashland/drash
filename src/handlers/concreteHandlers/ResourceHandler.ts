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

import { HttpMethod } from "../../domain/types/HttpMethod.ts";
import { DrashRequest } from "../../http/DrashRequest.ts";
import { IResource } from "../../resources/IResource.ts";
import { Handler } from "../Handler.ts";
import { Moogle } from "../../../deps.ts";

/**
 * The ResourceHandler class that handles resources logic
 *
 * @class
 * @since 3.0.0
 */
export class ResourceHandler extends Handler {
  #resources: Moogle<IResource>;

  public constructor(resources: Moogle<IResource>) {
    super();
    this.#resources = resources;
  }

  public override handle(request: DrashRequest) {
    const uri = request.url.split("/");
    // Remove the first element which would be ""
    uri.shift();
    /*
     * The search term for a URI is the URI in it's most basic form. Basically,
     * just "/something" instead of "/something/blah/what/ok?hello=world". The
     * resource index service will return all resources matching that basic URI.
     * Later down in this method, we iterate over each result that the resource
     * index service returns to find the best matching resource to the request
     * URL. Notice, we're searching for a URI at first and then matching against
     * a URL later.
     */
    const uriWithoutParams = "^/" + uri[0];

    const baseUrl = request.baseUrl;

    // Try our best to find a resource for that uri
    const resource = this.findResource(baseUrl, uriWithoutParams) ??
      this.findResource(baseUrl, "^/");

    if (resource == null) {
      // No resource found, we delegate to parent
      return super.handle(request);
    }

    const methodToExecute = request["method"].toUpperCase() as HttpMethod;
    return resource[methodToExecute](request);
  }

  private findResource(baseuri: string, uriWithoutParams: string) {
    const results = this.#resources.search(uriWithoutParams);

    for (const [, result] of results) {
      // Take the current result and see if it matches against the request URL
      const matchArray = baseuri.match(
        result.searchTerm,
      );

      if (matchArray) {
        // We found a resource!
        return result.item;
      }
    }
  }
}
