import { IService, Request, Response } from "../../mod.ts";

import { ConnInfo } from "../../deps.ts";

export class Service implements IService {
  #send = false;

  get send() {
    return this.#send;
  }

  protected end() {
    this.#send = true;
  }

  public runAfterResource(
    _request: Request,
    _response: Response,
    _connInfo: ConnInfo,
  ) {
  }

  public runBeforeResource(
    _request: Request,
    _response: Response,
    _connInfo: ConnInfo,
  ) {
  }
}
