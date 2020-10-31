import { Drash } from "../../../../mod.ts";

/**
 * @deprecated
 */
export default class TemplateEngineNullDataResource
  extends Drash.Http.Resource {
  static paths = ["/template-engine-null-data"];
  public GET() {
    this.response.headers.set("Content-Type", "text/html");
    const engine = new Drash.Compilers.TemplateEngine(
      Deno.realPathSync(".") + "/tests/integration/app_3001_views/templates",
    );
    Drash.Loggers.DeprecateLogger.warn(
      "You are using deprecated code. See migration solutions here: https://github.com/drashland/deno-drash-middleware/issues/53",
    );
    this.response.body = engine.render("/user_null_data.html", null);
    return this.response;
  }
}
