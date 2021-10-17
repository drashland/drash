import { IService, Request, Response } from "../../mod.ts";

export class Service implements IService {
  #send = false;

  get send() {
    return this.#send;
  }

  protected end() {
    this.#send = true;
  }

  public runAfterResource(_request: Request, _response: Response) {
  }

  public runBeforeResource(_request: Request, _response: Response) {
  }
}
