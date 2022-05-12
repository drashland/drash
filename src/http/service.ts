import { IService, Request, Response } from "../../mod.ts";

export class Service implements IService {
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
}
