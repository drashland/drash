import { IService, Request, Response, Service } from "../../../mod.ts";

export class ResponseTimeService extends Service implements IService {
  #startTime = 0;

  #endTime = 0;

  runBeforeResource() {
    this.#startTime = new Date().getTime();
  }

  runAfterResource(_request: Request, response: Response) {
    this.#endTime = new Date().getTime();
    const time = (this.#endTime - this.#startTime) + "ms";
    response.headers.set("X-Response-Time", time.toString());
  }
}
