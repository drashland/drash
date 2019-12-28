import Drash from "https://deno.land/x/drash/mod.ts";
import { denoMysql } from "./app.ts";

export default class HomeResource extends Drash.Http.Resource {

  static paths = ["/"];

  public async GET() {
    this.response.body = await denoMysql.query(`select * from user`);
    return this.response;
  }
}
