import { Request, Response } from "../../../mod.deno.ts";
import { createHash } from "./deps.ts";

export class ETagService {
  #options: { weak: boolean };

  #etags: Map<string, string> = new Map();

  constructor(options: { weak: boolean } = { weak: false }) {
    this.#options = options;
  }

  runAfterResource(request: Request, response: Response) {
    // if response body is empty, send a default etag
    if (
      response.body === null ||
      (typeof response.body === "string" && response.body.length === 0)
    ) {
      // when it's empty, we want to set a default etag

      // but if etag is already present on request, send a 304
      const header = '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
      if (request.headers.get("if-none-match")) {
        response.status(304).body(null);
        const existingModifiedDate = this.#etags.get(header) as string; // it will always be set due to this conditional
        response.headers({
          "last-modified": existingModifiedDate,
        });
      } else { // set the NEW default etag
        const date = new Date().toUTCString();
        response.headers({ "last-modified": date });
        this.#etags.set(header, date);
      }
      response.headers({ "etag": header });
      return;
    }

    // generate the hash
    const body = typeof response.body_init === "string"
      ? new TextEncoder().encode(response.body_init)
      : response.body_init as Uint8Array;
    const hash = createHash("sha1").update(body, "utf8").digest("base64")
      .toString().substring(0, 27);
    const len = body.byteLength;

    // create the etag value to use
    let header = `"${len.toString(16)}-${hash}"`;
    if (this.#options.weak === true) {
      header = "W/" + header;
    }

    response.headers({ "etag": header });

    // check if request already has an etag, if so,
    // if its the same as the generated etag from the response body
    const incomingRequestIfNoneMatchValue = request.headers.get(
      "if-none-match",
    );
    if (incomingRequestIfNoneMatchValue) { // request inc already has an etag set
      // so check if body hash matches
      if (header === incomingRequestIfNoneMatchValue) {
        // no need to send body, send not modified
        response.status(304).body(null);
        response.headers({
          "last-modified": this.#etags.get(header) as string,
        });
        return;
      } else {
        // res body is new
        response.status(200);
        const date = new Date().toUTCString();
        this.#etags.set(header, date);
        response.headers({ "last-modified": date });
        return;
      }
    }

    // else request doesnt have a new one so generate everything from scratch
    response.status(200);
    const date = new Date().toUTCString();
    this.#etags.set(header, date);
    response.headers({ "last-modified": date });
  }
}
