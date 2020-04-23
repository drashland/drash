import { Drash } from "../mod.ts";

export function Middleware(req: any) {
  if (!req.getHeaderParam("token")) {
    throw new Drash.Exceptions.HttpException(
      400,
      "No token, dude.",
    );
  }
}
