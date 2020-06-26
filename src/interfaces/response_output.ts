export interface ResponseOutput {
  body?: Uint8Array | null | string;
  headers?: Headers;
  status?: number;
  status_code?: number;
}
