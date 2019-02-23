export default class HttpException404 extends Error {

  public code = 404;

  // FILE MARKER: CONSTRUCTOR //////////////////////////////////////////////////////////////////////

  constructor(message?: string) {
    super(message);
  }
}
