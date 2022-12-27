import * as Interfaces from "../Interfaces.ts";
import * as Types from "../Types.ts";

export function createRequestChainOfResponsibility(
  handlers: Interfaces.RequestHandler[],
): Interfaces.RequestHandler {
  const first = handlers[0];

  handlers
    .reduce((previous, current) => {
      return previous.setNextHandler(current);
    });

  return first;
}
