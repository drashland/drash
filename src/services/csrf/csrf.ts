import { Errors, IService, Request, Response, Service } from "../../../mod.ts";
import { createHash, v4 } from "./deps.ts";

/**
 * This allows us to pass the TS compiler, so we can add properties to a method that uses it. See `csrf` method below
 */
interface F {
  (): void;
  token: string;
}

const primaryToken = createHash("sha512");
primaryToken.update(v4.generate());
const primaryTokenString = primaryToken.toString();

type Options = {
  cookie?: boolean;
};

const defaultOptions: Options = {
  cookie: false,
};

export class CSRFService extends Service implements IService {
  readonly #options: Options;

  public token: string = primaryTokenString; // or const csrf = Object.assign(oldCsrf, { token: primaryToken.toString() })

  constructor(options: Options = defaultOptions) {
    super();
    this.#options = options;
  }

  runBeforeResource(request: Request, _response: Response) {
    let requestToken: string | null = "";

    if (this.#options.cookie === true) {
      requestToken = request.getCookie("X-CSRF-TOKEN");
    } else {
      requestToken = request.headers.get("X-CSRF-TOKEN");
    }

    if (!requestToken) {
      throw new Errors.HttpError(
        400,
        "No CSRF token was passed in",
      );
    }

    if (requestToken !== primaryTokenString) {
      throw new Errors.HttpError(
        403,
        "The CSRF tokens do not match",
      );
    }
  }
}
