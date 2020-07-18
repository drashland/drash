import { Drash } from "../../../../mod.ts";

export default function ChangeResponseMiddleware(
  req: Drash.Http.Request,
  res?: Drash.Http.Response,
) {
  if (res) {
    res.body = "You got changed from the middleware!";
  }
}
