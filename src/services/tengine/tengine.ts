import { IService, Request, Response, Service } from "../../../mod.ts";
import { Jae } from "./jae.ts";

interface IOptions {
  views_path: string;
}

export class TengineService extends Service {
  readonly #options: IOptions;
  #template_engine: Jae;

  constructor(options: IOptions) {
    super();
    this.#options = options;
    this.#template_engine = new Jae(this.#options.views_path);
  }

  runBeforeResource(_request: Request, response: Response) {
    response.headers.set("Content-Type", "text/html");
    response.render = (filepath: string, data: unknown) => {
      return this.#template_engine.render(filepath, data);
    };
  }
}
