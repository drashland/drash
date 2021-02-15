/// Member: Drash.Interfaces.ResponseOutput

/**
 * Contains the type of ResponseOutput.
 *
 * body
 *
 *     The responses' body (e.g, "some body", {some: "body"}, etc.).
 *
 * headers
 *
 *     The response's headers (e.g., {"Content-Type": "application/json"}.
 *
 * status
 *
 *     The response's status.
 *
 * status_code
 *
 *     The response's status (e.g., 200), but under a semantic name.
 *
 * send
 *
 *     The response's send method..
 */
export interface ResponseOutput {
  body: Uint8Array | string | Deno.Reader;
  headers: Headers;
  status: number;
  status_code?: number;
  send?: () => ResponseOutput | undefined;
}
