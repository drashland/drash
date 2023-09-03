/**
 * Drash - A microframework for building JavaScript/TypeScript HTTP systems.
 * Copyright (C) 2023  Drash authors. The Drash authors are listed in the
 * AUTHORS file at <https://github.com/drashland/drash/AUTHORS>. This notice
 * applies to Drash version 3.X.X and any later version.
 *
 * This file is part of Drash. See <https://github.com/drashland/drash>.
 *
 * Drash is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * Drash is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * Drash. If not, see <https://www.gnu.org/licenses/>.
 */

import { NativeRequest } from "../../../src/core/Interfaces.ts";
import { createHash } from "./deps.ts";
import { NativeResponseBuilder } from "../../../src/builders/native_response_builder.ts";

export class ETagService {
  #options: { weak: boolean };

  #etags: Map<string, string> = new Map();

  constructor(options: { weak: boolean } = { weak: false }) {
    this.#options = options;
  }

  runAfterResource(request: NativeRequest, response: Response) {
    const responseBuilder = new NativeResponseBuilder();

    // if response body is empty, send a default etag
    if (
      response.body === null ||
      (typeof response.body === "string" && response.body.length === 0)
    ) {
      // when it's empty, we want to set a default etag

      // but if etag is already present on request, send a 304
      const header = '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
      if (request.headers.get("if-none-match")) {
        responseBuilder.status(304).body(null);
        const existingModifiedDate = this.#etags.get(header) as string; // it will always be set due to this conditional
        responseBuilder.headers({
          "last-modified": existingModifiedDate,
        });
      } else { // set the NEW default etag
        const date = new Date().toUTCString();
        responseBuilder.headers({ "last-modified": date });
        this.#etags.set(header, date);
      }
      responseBuilder.headers({ "etag": header });
      return;
    }

    // generate the hash
    const body = typeof responseBuilder.body_init === "string"
      ? new TextEncoder().encode(responseBuilder.body_init)
      : responseBuilder.body_init as Uint8Array;
    const hash = createHash("sha1").update(body, "utf8").digest("base64")
      .toString().substring(0, 27);
    const len = body.byteLength;

    // create the etag value to use
    let header = `"${len.toString(16)}-${hash}"`;
    if (this.#options.weak === true) {
      header = "W/" + header;
    }

    responseBuilder.headers({ "etag": header });

    // check if request already has an etag, if so,
    // if its the same as the generated etag from the response body
    const incomingRequestIfNoneMatchValue = request.headers.get(
      "if-none-match",
    );
    if (incomingRequestIfNoneMatchValue) { // request inc already has an etag set
      // so check if body hash matches
      if (header === incomingRequestIfNoneMatchValue) {
        // no need to send body, send not modified
        responseBuilder.status(304).body(null);
        responseBuilder.headers({
          "last-modified": this.#etags.get(header) as string,
        });
        return;
      } else {
        // res body is new
        responseBuilder.status(200);
        const date = new Date().toUTCString();
        this.#etags.set(header, date);
        responseBuilder.headers({ "last-modified": date });
        responseBuilder.body(responseBuilder.body_init ?? response.body);
        return responseBuilder.build();
      }
    }

    // else request doesnt have a new one so generate everything from scratch
    responseBuilder.status(200);
    const date = new Date().toUTCString();
    this.#etags.set(header, date);
    responseBuilder.headers({ "last-modified": date });
    responseBuilder.body(responseBuilder.body_init ?? response.body);
    return responseBuilder.build();
  }
}
