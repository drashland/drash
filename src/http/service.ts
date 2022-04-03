import { IService, Request, Response } from "../../mod.ts";

export class Service implements IService {
  #end_lifecycle = false;

  get end_lifecycle() {
    return this.#end_lifecycle;
  }

  protected end() {
    this.#end_lifecycle = true;
  }

  public runAfterResource(
    _request: Request,
    _response: Response,
  ) {
  }

  public runBeforeResource(
    _request: Request,
    _response: Response,
  ) {
  }

  public resetInstance(): void {
    this.#end_lifecycle = false;
  }
}
