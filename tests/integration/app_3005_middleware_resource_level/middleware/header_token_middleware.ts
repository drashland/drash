import { Drash } from "../../../../mod.ts";

export default function HeaderTokenMiddleware(req: Drash.Http.Request) {
  if (!req.getHeaderParam("token")) {
    throw new Drash.Exceptions.HttpException(
      400,
      "No token, dude.",
    );
  }
}
