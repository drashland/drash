import {
  IService,
  Request,
  Resource,
  Response,
  Server,
  Types,
} from "../../mod.ts";

export class Service implements IService {
  #send = false;

  get send() {
    return this.#send;
  }

  protected end() {
    this.#send = true;
  }
}
