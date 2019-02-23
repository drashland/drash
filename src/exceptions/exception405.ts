export default class HttpException405 extends Error {

  public code = 405;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  constructor(message?: string) {
    super(message);
  }
}
