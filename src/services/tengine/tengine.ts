import { IContext, IService, Service } from "../../../mod.ts";
import { Jae } from "./jae.ts";

interface IOptions {
  render:
    ((...args: unknown[]) => Promise<boolean | string> | boolean | string);
  // deno-lint-ignore camelcase
  views_path?: string;
}

export class TengineService extends Service implements IService {
  readonly #options: IOptions;

  #templateEngine: Jae | null = null;

  constructor(options: IOptions) {
    super();
    this.#options = options;
  }

  runAfterResource(context: IContext) {
    context.response.headers.set("Content-Type", "text/html");

    if (this.#options.views_path) {
      if (!this.#templateEngine) {
        this.#templateEngine = new Jae(this.#options.views_path);
      }
      this.#options.render = (...args: unknown[]): string => {
        return this.#templateEngine!.render(
          args[0] as string,
          args[1] as unknown,
        );
      };
    }

    if (context.response.render) {
      context.response.render = this.#options.render;
      return;
    }
  }
}
