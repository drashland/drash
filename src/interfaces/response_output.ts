export interface ResponseOutput {
  body: Uint8Array | string | Deno.Reader;
  headers: Headers;
  status: number;
  status_code?: number;
  send?: () => ResponseOutput | undefined;
}
