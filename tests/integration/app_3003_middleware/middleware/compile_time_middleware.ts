import { Drash } from "../../../../mod.ts";

export default function CompileTimeMiddleware() {
  const compiledStuff: string[] = [];

  async function compile(): Promise<void> {
    compiledStuff.push("WE OUT HERE");
  }

  async function run(
    request: Drash.Http.Request,
    response: Drash.Http.Response,
  ): Promise<void> {
    if (request.url == "/compile-time-middleware") {
      response.body = compiledStuff[0];
    }
  }
  return {
    compile,
    run,
  };
}
