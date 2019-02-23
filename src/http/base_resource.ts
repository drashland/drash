import Response from './response.ts';

export default class BaseResource {
  protected response;
  protected request; // Gets set in `Server.run()`

  constructor() {
    this.response = new Response();
  }
}
