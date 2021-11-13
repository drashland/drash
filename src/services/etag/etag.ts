import { IService, Request, Response, Service } from "../../../mod.ts";
import { createHash } from "./deps.ts";

export class EtagService extends Service implements IService {
  #options: { weak: boolean };

  constructor(options: { weak: boolean } = { weak: false }) {
    super();
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
      if (request.headers.get('if-none-match')) {
        response.status = 304
        response.body = null
      } else { // set the NEW default etag
        response.headers.set("Last-Modified", new Date().toUTCString());
      }
      response.headers.set("etag", '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"');
      return;
    }

    // generate the hash
    const body = typeof response.body === "string"
      ? new TextEncoder().encode(response.body)
      : response.body as Uint8Array;
    const hash = createHash("sha1").update(body, "utf8").digest("base64")
      .toString().substring(0, 27);
    const len = body.byteLength;

    // create the etag value to use
    let header = `"${len.toString(16)}-${hash}"`;
    if (this.#options.weak === true) {
      header = "W/" + header;
    }

    // check if request already has an etag, if so,
    // if its the same as the generated etag from the response body
    const incomingRequestIfNoneMatchValue = request.headers.get('if-none-match')
    if (incomingRequestIfNoneMatchValue) { // request inc already has an etag set
      // so check if body hash matches
      if (header === incomingRequestIfNoneMatchValue) {
        // no need to send body, send not modified
        response.status = 304
        response.body = null;
        response.headers.set("etag", header);
        return;
      }
    }

    // else it isn't the same, so set a NEW etag on res
    response.status = 200
    response.headers.set("etag", header);
    response.headers.set("Last-Modified", new Date().toUTCString());
  }
}
