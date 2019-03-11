export default class HttpException extends Error {
  public code: number;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////

  constructor(code: number, message?: string) {
    super(message);
    this.code = code;
  }
}
