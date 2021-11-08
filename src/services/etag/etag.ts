import { IService, Request, Response, Service } from "../../../mod.ts";
import { createHash } from "./deps.ts";

export class EtagService extends Service implements IService {
  runAfterResource(_request: Request, response: Response) {
    if (
      response.body === null ||
      (typeof response.body === "string" && response.body.length === 0)
    ) {
      response.headers.set("etag", '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"');
      return;
    }
    const body = typeof response.body === "string"
      ? new TextEncoder().encode(response.body)
      : response.body as Uint8Array;
    const hash = createHash("sha1").update(body, "utf8").digest("base64")
      .toString().substring(0, 27);
    const len = body.byteLength;
    response.headers.set("etag", `"${len.toString(16)}-${hash}"`);
  }
}
